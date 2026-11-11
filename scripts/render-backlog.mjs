#!/usr/bin/env node
/**
 * Renders docs/planning/backlog.md from scripts/github-data.mjs.
 *
 * The GitHub issues are the source of truth once the setup script has run.
 * This file exists so the backlog is readable offline, reviewable in a diff,
 * and printable before GitHub is configured.
 *
 * Usage:
 *   node scripts/render-backlog.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { labels, milestones, issues } from './github-data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, '..', 'docs', 'planning', 'backlog.md');

const sprintNames = milestones.map((milestone) => milestone.title);
const totalHours = issues.reduce((sum, issue) => sum + issue.estimateHours, 0);

const lines = [];

lines.push('# Mihak — Full Backlog');
lines.push('');
lines.push(
  '> Generated from `scripts/github-data.mjs`. Do not edit by hand — edit the data file and run `node scripts/render-backlog.mjs`.',
);
lines.push('');
lines.push(`**Issues:** ${issues.length} · **Sprints:** ${milestones.length} · **Planned effort:** ${totalHours} h`);
lines.push('');
lines.push('Every issue is assigned to one person. Order is sequential by dependency, not by team parallelism.');
lines.push('');

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------

lines.push('## 1. Issue index');
lines.push('');
lines.push('| # | Title | Labels | Sprint | Hours | Depends on |');
lines.push('|---|---|---|---|---|---|');

issues.forEach((issue, index) => {
  const dependencies = issue.dependsOn.length > 0 ? issue.dependsOn.join(', ') : '—';
  const sprint = issue.milestone.replace('Sprint ', 'S').split(':')[0];
  lines.push(
    `| ${index + 1} | ${issue.title} | ${issue.labels.map((label) => `\`${label}\``).join(' ')} | ${sprint} | ${issue.estimateHours} | ${dependencies} |`,
  );
});
lines.push('');

// ---------------------------------------------------------------------------
// Per-sprint tables
// ---------------------------------------------------------------------------

lines.push('## 2. Sprint allocation');
lines.push('');

for (const milestone of milestones) {
  const sprintIssues = issues.filter((issue) => issue.milestone === milestone.title);
  const hours = sprintIssues.reduce((sum, issue) => sum + issue.estimateHours, 0);
  lines.push(`### ${milestone.title}`);
  lines.push('');
  lines.push(`Due: ${milestone.due_on.slice(0, 10)} · ${sprintIssues.length} issues · ${hours} h planned`);
  lines.push('');
  lines.push('| Key | Title | Hours | Depends on |');
  lines.push('|---|---|---|---|');
  for (const issue of sprintIssues) {
    const dependencies = issue.dependsOn.length > 0 ? issue.dependsOn.join(', ') : '—';
    lines.push(`| ${issue.key} | ${issue.title} | ${issue.estimateHours} | ${dependencies} |`);
  }
  lines.push('');
}

// ---------------------------------------------------------------------------
// Label table
// ---------------------------------------------------------------------------

lines.push('## 3. Labels');
lines.push('');
lines.push('These are the exact EchoGrow labels, colors, and descriptions. The setup script syncs them idempotently.');
lines.push('');
lines.push('| Label | Color | Description |');
lines.push('|---|---|---|');
for (const label of labels) {
  lines.push(`| \`${label.name}\` | \`#${label.color}\` | ${label.description} |`);
}
lines.push('');

// ---------------------------------------------------------------------------
// Full issue bodies
// ---------------------------------------------------------------------------

lines.push('## 4. Issue bodies');
lines.push('');
lines.push('Copy-ready as-is. On GitHub the `## Dependencies` section is appended automatically with real issue numbers.');
lines.push('');

for (const issue of issues) {
  const sprintIssues = issues.filter((item) => item.milestone === issue.milestone);
  const position = sprintIssues.findIndex((item) => item.key === issue.key) + 1;

  lines.push('---');
  lines.push('');
  lines.push(`### ${issue.key} — ${issue.title}`);
  lines.push('');
  lines.push(
    `**Milestone:** ${issue.milestone} · **Estimate:** ${issue.estimateHours} h · **Order in sprint:** ${position}/${sprintIssues.length}`,
  );
  lines.push('');
  lines.push(`**Labels:** ${issue.labels.map((label) => `\`${label}\``).join(' ')}${issue.dependsOn.length > 0 ? ' `blocked`' : ''}`);
  lines.push('');
  lines.push(issue.body);
  lines.push('');
  if (issue.dependsOn.length > 0) {
    lines.push('## Dependencies');
    lines.push('');
    lines.push(`- Depends on ${issue.dependsOn.join(', ')}.`);
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('## 5. What is deliberately not here');
lines.push('');
lines.push('Deferred to v0.1.1 or later. They are not in the backlog and must not be pulled into a sprint:');
lines.push('');
lines.push('- Automatic retries and 429 backoff.');
lines.push('- A hard budget cap per run.');
lines.push('- Server-Sent Events, cancellation, and resume.');
lines.push('- Regression detection between runs and comparability keys.');
lines.push('- CSV/JSONL export and image input.');
lines.push('- Human review / manual override of judge scores.');
lines.push('- Charts and dashboards.');
lines.push('- Accounts, teams, and sharing.');
lines.push('');
lines.push('Acceptance rule: if a feature is not on this list and not in the six milestones, it is out of scope for v0.1.');
lines.push('');

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${lines.join('\n')}\n`, 'utf8');

console.log(`Wrote ${outFile}`);
console.log(`${issues.length} issues · ${milestones.length} sprints · ${totalHours} h`);
