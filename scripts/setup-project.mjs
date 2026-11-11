#!/usr/bin/env node
/**
 * Creates and configures the Mihak GitHub Project (v2) board.
 *
 * What it does, idempotently:
 *   - finds or creates the project "Mihak" and links it to the repository
 *   - renames the Status field options to Backlog / Ready / In Progress / In Review / Done / Blocked
 *   - creates a Board view
 *   - adds every open issue as an item and files it under Backlog
 *
 * Requires a token with the `project` scope (classic) or Projects read+write (fine-grained).
 * The default git credential token usually has only `repo`, which is not enough.
 *
 * Token resolution, first match wins:
 *   1. GITHUB_TOKEN
 *   2. GH_TOKEN
 *   3. --token-file <path>
 *   4. MIHAK_TOKEN_FILE
 *   5. ~/.mihak/github-token
 *   6. git credential fill
 *
 * Usage:
 *   node scripts/setup-project.mjs --dry-run
 *   node scripts/setup-project.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const API = 'https://api.github.com/graphql';
const args = parseArgs(process.argv.slice(2));
const dryRun = Boolean(args['dry-run']);
const title = typeof args.title === 'string' ? args.title : 'Mihak';

const repo = args.repo || process.env.GITHUB_REPOSITORY || repoFromRemote();
if (!repo || !repo.includes('/')) {
  fail('Could not determine the repository. Pass --repo owner/name.');
}
const [owner, name] = repo.split('/');

const COLUMNS = [
  { name: 'Backlog', color: 'GRAY', description: 'Not ready yet.' },
  { name: 'Ready', color: 'BLUE', description: 'Meets Definition of Ready.' },
  { name: 'In Progress', color: 'YELLOW', description: 'Actively being worked. WIP limit 2.' },
  { name: 'In Review', color: 'PURPLE', description: 'Pull request open, CI running.' },
  { name: 'Done', color: 'GREEN', description: 'Merged, CI green, deployed.' },
  { name: 'Blocked', color: 'RED', description: 'Waiting on a dependency.' },
];

const token = resolveToken();
main().catch((error) => {
  const text = error?.message || String(error);
  if (text.includes('INSUFFICIENT_SCOPES') || text.includes('read:project') || text.includes('project')) {
    fail(`${text}

The current token cannot access GitHub Projects (v2). It needs the "project" scope.

  1. Create a classic token with repo + project:
     https://github.com/settings/tokens/new?scopes=repo,project&description=mihak-project

  2. Save it once, outside the repository:
     New-Item -ItemType Directory -Force "$env:USERPROFILE\\.mihak" | Out-Null
     $t = Read-Host "Paste the token" -AsSecureString
     [Runtime.InteropServices.Marshal]::PtrToStringAuto(
       [Runtime.InteropServices.Marshal]::SecureStringToBSTR($t)
     ) | Set-Content "$env:USERPROFILE\\.mihak\\github-token" -NoNewline

  3. Re-run: node scripts/setup-project.mjs`);
  }
  fail(text);
});

async function main() {
  console.log(`Repository: ${repo}`);
  console.log(`Project:    ${title}`);
  console.log(`Mode:       ${dryRun ? 'dry-run (no writes)' : 'write'}`);

  const base = await graphql(
    `query($owner: String!, $name: String!) {
      viewer { id login }
      repository(owner: $owner, name: $name) { id nameWithOwner }
    }`,
    { owner, name },
  );

  const repositoryId = base.repository.id;
  let project = await findProject(base.viewer.login, title);
  let created = false;

  if (!project) {
    if (dryRun) {
      console.log('Would create the project and link it to the repository.');
      project = { id: '(dry-run)', number: 0, url: '(dry-run)', title };
      created = true;
    } else {
      const data = await graphql(
        `mutation($input: CreateProjectV2Input!) {
          createProjectV2(input: $input) { projectV2 { id number url title } }
        }`,
        { input: { ownerId: base.viewer.id, repositoryId, title } },
      );
      project = data.createProjectV2.projectV2;
      created = true;
      console.log(`Created project #${project.number}.`);
    }
  } else {
    console.log(`Using existing project #${project.number}.`);
    if (!dryRun) {
      try {
        await graphql(
          `mutation($input: LinkProjectV2ToRepositoryInput!) {
            linkProjectV2ToRepository(input: $input) { repository { nameWithOwner } }
          }`,
          { input: { projectId: project.id, repositoryId } },
        );
      } catch (error) {
        if (!String(error.message).includes('already')) throw error;
      }
    }
  }

  if (dryRun && created) {
    console.log('Would set Status options:', COLUMNS.map((column) => column.name).join(' → '));
    console.log('Would create a Board view and add every open issue to Backlog.');
    console.log('Dry run complete.');
    return;
  }

  // ---------------------------------------------------------------- Status field
  const statusField = await ensureStatusField(project.id);
  const options = await ensureStatusOptions(statusField);
  const backlog = options.find((option) => option.name === 'Backlog');
  if (!backlog) throw new Error('The Backlog option was not found after updating the Status field.');

  // ---------------------------------------------------------------- Board view
  const views = await graphql(
    `query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 { views(first: 20) { nodes { id name layout } } }
      }
    }`,
    { projectId: project.id },
  );
  const existingBoard = views.node.views.nodes.find((view) => view.layout === 'BOARD_LAYOUT');

  if (!existingBoard) {
    await graphql(
      `mutation($input: CreateProjectV2ViewInput!) {
        createProjectV2View(input: $input) { projectV2View { id name layout } }
      }`,
      { input: { projectId: project.id, name: 'Board', layout: 'BOARD_LAYOUT' } },
    );
    console.log('Created Board view.');
  } else {
    console.log(`Board view already exists (${existingBoard.name}).`);
  }

  // ---------------------------------------------------------------- Items
  const [projectItems, repositoryIssues] = await Promise.all([
    graphql(
      `query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content { __typename ... on Issue { id number } }
              }
            }
          }
        }
      }`,
      { projectId: project.id },
    ),
    graphql(
      `query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          issues(first: 100, states: [OPEN], orderBy: { field: CREATED_AT, direction: ASC }) {
            nodes { id number title }
          }
        }
      }`,
      { owner, name },
    ),
  ]);

  const existingContent = new Set(
    projectItems.node.items.nodes
      .map((item) => item.content?.id)
      .filter(Boolean),
  );
  const issues = repositoryIssues.repository.issues.nodes;
  let added = 0;

  for (const issue of issues) {
    if (existingContent.has(issue.id)) continue;
    const data = await graphql(
      `mutation($input: AddProjectV2ItemByIdInput!) {
        addProjectV2ItemById(input: $input) { item { id } }
      }`,
      { input: { projectId: project.id, contentId: issue.id } },
    );
    await graphql(
      `mutation($input: UpdateProjectV2ItemFieldValueInput!) {
        updateProjectV2ItemFieldValue(input: $input) { projectV2Item { id } }
      }`,
      {
        input: {
          projectId: project.id,
          itemId: data.addProjectV2ItemById.item.id,
          fieldId: statusField.id,
          value: { singleSelectOptionId: backlog.id },
        },
      },
    );
    added += 1;
    process.stdout.write(`\rAdded ${added} issue(s)...`);
  }

  console.log('');
  console.log('');
  console.log('Summary');
  console.log(`  Project:   ${project.title} (#${project.number})`);
  console.log(`  URL:       ${project.url}`);
  console.log(`  Columns:   ${COLUMNS.map((column) => column.name).join(' → ')}`);
  console.log(`  Issues:    ${added} added, ${issues.length - added} already present`);
  console.log('');
  console.log('Remaining manual step: open the board view, set the In Progress column limit to 2,');
  console.log('and confirm the four workflows (item closed, PR merged, PR linked, item reopened).');
}

// ---------------------------------------------------------------------------
// Project helpers
// ---------------------------------------------------------------------------

async function findProject(login, projectTitle) {
  const data = await graphql(
    `query {
      viewer {
        projectsV2(first: 100) { nodes { id number title url } }
      }
    }`,
  );
  return data.viewer.projectsV2.nodes.find((project) => project.title === projectTitle) || null;
}

async function ensureStatusField(projectId) {
  const data = await graphql(
    `query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 50) {
            nodes {
              ... on ProjectV2FieldCommon { id name dataType }
              ... on ProjectV2SingleSelectField { options { id name } }
            }
          }
        }
      }
    }`,
    { projectId },
  );

  const fields = data.node.fields.nodes;
  const status = fields.find((field) => field.name === 'Status' && field.dataType === 'SINGLE_SELECT');
  if (status) return status;

  const created = await graphql(
    `mutation($input: CreateProjectV2FieldInput!) {
      createProjectV2Field(input: $input) {
        projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } }
      }
    }`,
    {
      input: {
        projectId,
        dataType: 'SINGLE_SELECT',
        name: 'Status',
        singleSelectOptions: COLUMNS,
      },
    },
  );
  console.log('Created Status field.');
  return created.createProjectV2Field.projectV2Field;
}

async function ensureStatusOptions(field) {
  const current = field.options || [];
  const desired = COLUMNS.map((column) => column.name);

  if (current.length === desired.length && desired.every((name) => current.some((option) => option.name === name))) {
    console.log('Status options already correct.');
    return current;
  }

  const input = COLUMNS.map((column) => {
    const match = current.find((option) => option.name === column.name);
    return {
      ...(match ? { id: match.id } : {}),
      name: column.name,
      color: column.color,
      description: column.description,
    };
  });

  const data = await graphql(
    `mutation($input: UpdateProjectV2FieldInput!) {
      updateProjectV2Field(input: $input) {
        projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } }
      }
    }`,
    { input: { fieldId: field.id, singleSelectOptions: input } },
  );

  const updated = data.updateProjectV2Field.projectV2Field;
  console.log('Updated Status options:', updated.options.map((option) => option.name).join(', '));
  return updated.options;
}

// ---------------------------------------------------------------------------
// GraphQL
// ---------------------------------------------------------------------------

async function graphql(query, variables = {}) {
  const response = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'mihak-project-setup',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status}: ${data.message || 'unknown error'}`);
  }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error(data.errors.map((error) => `${error.type || 'ERROR'}: ${error.message}`).join('\n'));
  }
  if (!data.data) throw new Error('GraphQL returned no data.');
  return data.data;
}

// ---------------------------------------------------------------------------
// Token and repository discovery
// ---------------------------------------------------------------------------

function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  if (typeof args['token-file'] === 'string') return readTokenFile(args['token-file']);
  if (process.env.MIHAK_TOKEN_FILE) return readTokenFile(process.env.MIHAK_TOKEN_FILE);

  const defaultFile = join(homedir(), '.mihak', 'github-token');
  try {
    return readFileSync(defaultFile, 'utf8').trim();
  } catch {
    // Fall through to the git credential store.
  }

  return tokenFromGitCredential();
}

function readTokenFile(path) {
  return readFileSync(path, 'utf8').trim();
}

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

function fail(message) {
  console.error(`\nError: ${message}`);
  process.exit(1);
}
