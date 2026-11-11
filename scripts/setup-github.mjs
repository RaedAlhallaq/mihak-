#!/usr/bin/env node
/**
 * Idempotent GitHub setup for the Mihak backlog.
 *
 * Creates or updates:
 *   - 20 labels
 *   - 6 sprint milestones
 *   - 30 issues assigned to the authenticated user
 *
 * Token is read from `git credential fill` first, then from GITHUB_TOKEN / GH_TOKEN.
 * No third-party libraries. Requires Node 20+ (global fetch).
 *
 * Usage:
 *   node scripts/setup-github.mjs --dry-run
 *   node scripts/setup-github.mjs --repo owner/mihak
 *   GITHUB_TOKEN=... node scripts/setup-github.mjs --repo owner/mihak
 */

import { execFileSync } from 'node:child_process';
import { labels, milestones, issues } from './github-data.mjs';

const API = 'https://api.github.com';
const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`Usage: node scripts/setup-github.mjs [--repo owner/repo] [--dry-run]

Options:
  --repo owner/repo   Target repository. Defaults to GITHUB_REPOSITORY or the origin remote.
  --dry-run           Read GitHub state and print the plan without writing anything.
  --help              Show this message.`);
  process.exit(0);
}

const repo = args.repo || process.env.GITHUB_REPOSITORY || repoFromRemote();
if (!repo || !/^[^/]+\/[^/]+$/.test(repo)) {
  fail(`Could not determine the repository.
Pass --repo owner/repo, set GITHUB_REPOSITORY, or add a GitHub origin remote:
  git remote add origin git@github.com:owner/mihak.git`);
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || tokenFromGitCredential();
if (!token) {
  fail(`No GitHub token found.
Store one for git (git credential approve) or set GITHUB_TOKEN.
Classic token scope: repo. Fine-grained: Issues RW, Contents RW, Metadata R.`);
}

const dryRun = Boolean(args['dry-run']);
const stats = {
  labels: { created: 0, updated: 0, unchanged: 0 },
  milestones: { created: 0, updated: 0, unchanged: 0 },
  issues: { created: 0, updated: 0, unchanged: 0 },
};
const issueIndex = new Map();

main().catch((error) => {
  fail(error?.stack || error?.message || String(error));
});

async function main() {
  console.log(`Repository: ${repo}`);
  console.log(`Mode: ${dryRun ? 'dry-run (no writes)' : 'write'}`);

  const me = await api('GET', '/user');
  const assignee = process.env.GITHUB_ASSIGNEE || me.login;

  await ensureLabels();
  const milestoneNumbers = await ensureMilestones();
  await ensureIssues(milestoneNumbers, assignee);

  printSummary();
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

async function ensureLabels() {
  const existing = new Map((await paginate(`/repos/${repo}/labels`)).map((l) => [l.name, l]));

  for (const label of labels) {
    const current = existing.get(label.name);
    if (!current) {
      stats.labels.created += 1;
      if (!dryRun) await api('POST', `/repos/${repo}/labels`, label);
      continue;
    }
    const changed = current.color !== label.color || (current.description || '') !== label.description;
    if (!changed) {
      stats.labels.unchanged += 1;
      continue;
    }
    stats.labels.updated += 1;
    if (!dryRun) {
      await api('PATCH', `/repos/${repo}/labels/${encodeURIComponent(label.name)}`, {
        new_name: label.name,
        color: label.color,
        description: label.description,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

async function ensureMilestones() {
  const existing = new Map(
    (await paginate(`/repos/${repo}/milestones?state=all`)).map((m) => [m.title, m]),
  );
  const numbers = new Map();

  for (const milestone of milestones) {
    const current = existing.get(milestone.title);
    if (!current) {
      stats.milestones.created += 1;
      if (dryRun) {
        numbers.set(milestone.title, -1);
        continue;
      }
      const created = await api('POST', `/repos/${repo}/milestones`, milestone);
      numbers.set(milestone.title, created.number);
      continue;
    }

    numbers.set(milestone.title, current.number);
    const changed =
      new Date(current.due_on || 0).toISOString() !== new Date(milestone.due_on).toISOString() ||
      (current.description || '') !== milestone.description;
    if (!changed) {
      stats.milestones.unchanged += 1;
      continue;
    }
    stats.milestones.updated += 1;
    if (!dryRun) {
      await api('PATCH', `/repos/${repo}/milestones/${current.number}`, {
        description: milestone.description,
        due_on: milestone.due_on,
      });
    }
  }

  return numbers;
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

async function ensureIssues(milestoneNumbers, assignee) {
  const existingIssues = (await paginate(`/repos/${repo}/issues?state=all`)).filter(
    (issue) => !issue.pull_request,
  );
  const byTitle = new Map(existingIssues.map((issue) => [issue.title, issue]));

  for (const issue of issues) {
    const milestoneNumber = milestoneNumbers.get(issue.milestone);
    if (milestoneNumber === undefined) {
      throw new Error(`Milestone not resolved: ${issue.milestone}`);
    }

    const payload = {
      title: issue.title,
      body: resolveDependencies(issue),
      labels: issueLabels(issue),
      assignees: [assignee],
      ...(milestoneNumber > 0 ? { milestone: milestoneNumber } : {}),
    };

    const current = byTitle.get(issue.title);
    if (current) {
      const changed =
        (current.body || '') !== payload.body ||
        (current.milestone?.title || '') !== issue.milestone ||
        !sameLabels(current.labels, payload.labels);
      if (!changed) {
        stats.issues.unchanged += 1;
      } else {
        stats.issues.updated += 1;
        if (!dryRun) {
          await api('PATCH', `/repos/${repo}/issues/${current.number}`, {
            body: payload.body,
            labels: payload.labels,
            milestone: payload.milestone ?? null,
            assignees: payload.assignees,
          });
        }
      }
      issueIndex.set(issue.key, { number: current.number, url: current.html_url });
      continue;
    }

    stats.issues.created += 1;
    if (dryRun) {
      issueIndex.set(issue.key, { number: null, url: '(dry-run)' });
      continue;
    }

    const created = await api('POST', `/repos/${repo}/issues`, payload);
    issueIndex.set(issue.key, { number: created.number, url: created.html_url });
    byTitle.set(created.title, created);

    // Dependencies that point forward in the list need a second pass below.
    await sleep(150);
  }

  if (!dryRun) {
    await patchForwardDependencies();
  }
}

async function patchForwardDependencies() {
  for (const issue of issues) {
    const unresolved = issue.dependsOn.filter((key) => !issueIndex.has(key));
    if (unresolved.length > 0) {
      throw new Error(`Unresolved dependency keys for ${issue.key}: ${unresolved.join(', ')}`);
    }
    const current = issueIndex.get(issue.key);
    if (!current || current.number === null) continue;

    const body = resolveDependencies(issue);
    if (!body.includes('{{')) continue;
    await api('PATCH', `/repos/${repo}/issues/${current.number}`, { body });
    await sleep(100);
  }
}

function resolveDependencies(issue) {
  const base = issue.body;
  if (issue.dependsOn.length === 0) return base;
  const refs = issue.dependsOn.map((key) => {
    const info = issueIndex.get(key);
    if (!info || info.number === null) return `{{${key}}}`;
    return `#${info.number}`;
  });
  return `${base}\n\n## Dependencies\n\n- Depends on ${refs.join(', ')}.`;
}

function issueLabels(issue) {
  const list = [...issue.labels];
  if (issue.dependsOn.length > 0 && !list.includes('blocked')) list.push('blocked');
  return list;
}

function sameLabels(current, desired) {
  const a = new Set(current.map((label) => label.name));
  const b = new Set(desired);
  if (a.size !== b.size) return false;
  for (const name of b) if (!a.has(name)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// GitHub API
// ---------------------------------------------------------------------------

async function api(method, path, body) {
  let attempt = 0;

  while (true) {
    attempt += 1;
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'mihak-setup-script',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.ok) {
      if (response.status === 204) return null;
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // Non-JSON error body; keep the text.
    }

    const rateLimited =
      (response.status === 403 || response.status === 429) &&
      response.headers.get('x-ratelimit-remaining') === '0';

    if (rateLimited && attempt <= 3) {
      const reset = Number(response.headers.get('x-ratelimit-reset') || 0) * 1000;
      const waitMs = Math.min(Math.max(reset - Date.now(), 1000), 60_000);
      console.warn(`Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
      continue;
    }

    const message = data?.message || text || response.statusText;
    const error = new Error(`${method} ${path} -> ${response.status}: ${message}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
}

async function paginate(path) {
  const items = [];
  for (let page = 1; page <= 20; page += 1) {
    const separator = path.includes('?') ? '&' : '?';
    const batch = await api('GET', `${path}${separator}per_page=100&page=${page}`);
    if (!Array.isArray(batch)) {
      throw new Error(`Expected a list from ${path}, got ${typeof batch}`);
    }
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

// ---------------------------------------------------------------------------
// Token and repository discovery
// ---------------------------------------------------------------------------

function tokenFromGitCredential() {
  try {
    const output = execFileSync('git', ['credential', 'fill'], {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    const line = output.split(/\r?\n/).find((row) => row.startsWith('password='));
    return line ? line.slice('password='.length).trim() : null;
  } catch {
    return null;
  }
}

function repoFromRemote() {
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/i);
    return match ? `${match[1]}/${match[2]}` : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = true;
    }
  }
  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printSummary() {
  console.log('');
  console.log('Summary');
  console.log(`  Labels:     ${stats.labels.created} created, ${stats.labels.updated} updated, ${stats.labels.unchanged} unchanged`);
  console.log(`  Milestones: ${stats.milestones.created} created, ${stats.milestones.updated} updated, ${stats.milestones.unchanged} unchanged`);
  console.log(`  Issues:     ${stats.issues.created} created, ${stats.issues.updated} updated, ${stats.issues.unchanged} unchanged`);
  console.log('');
  console.log('Issues');
  for (const issue of issues) {
    const info = issueIndex.get(issue.key);
    const number = info?.number ? `#${info.number}` : '(dry-run)';
    console.log(`  ${number.padEnd(10)} ${issue.key.padEnd(5)} ${issue.title}`);
  }
  console.log('');
  console.log(`Board: https://github.com/${repo}/issues`);
  console.log(`Milestones: https://github.com/${repo}/milestones`);
  if (dryRun) {
    console.log('');
    console.log('Dry run complete. Re-run without --dry-run to apply.');
  }
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}
