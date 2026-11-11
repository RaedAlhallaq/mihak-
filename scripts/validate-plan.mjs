#!/usr/bin/env node
/**
 * Validates the planning data before it reaches GitHub.
 *
 * Checks:
 *   - the 20 labels exist, are unique, and use valid hex colors
 *   - the six milestones are unique and ordered
 *   - there are 30 issues, five per milestone, with unique keys and titles
 *   - every dependency exists, is not self-referential, and forms no cycle
 *   - every referenced label exists and every issue has exactly one priority
 *   - each issue body follows the What / Why / Acceptance Criteria format
 *   - each sprint totals 16 planned hours
 *
 * Usage:
 *   node scripts/validate-plan.mjs
 */

import { labels, milestones, issues } from './github-data.mjs';

const EXPECTED_LABELS = 20;
const EXPECTED_MILESTONES = 6;
const EXPECTED_ISSUES = 30;
const ISSUES_PER_SPRINT = 5;
const HOURS_PER_SPRINT = 16;
const TAGS = ['Setup', 'Database', 'Backend', 'AI', 'Frontend', 'DevOps', 'Testing', 'Documentation'];

const failures = [];
const fail = (message) => failures.push(message);

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

if (labels.length !== EXPECTED_LABELS) {
  fail(`Expected ${EXPECTED_LABELS} labels, found ${labels.length}.`);
}

const labelNames = new Set();
for (const label of labels) {
  if (labelNames.has(label.name)) fail(`Duplicate label: ${label.name}`);
  labelNames.add(label.name);
  if (!/^[0-9a-f]{6}$/i.test(label.color)) fail(`Label "${label.name}" has an invalid color: ${label.color}`);
  if (!label.description || label.description.length < 3) fail(`Label "${label.name}" has no description.`);
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

if (milestones.length !== EXPECTED_MILESTONES) {
  fail(`Expected ${EXPECTED_MILESTONES} milestones, found ${milestones.length}.`);
}

const milestoneTitles = new Set();
let previousDue = 0;
for (const milestone of milestones) {
  if (milestoneTitles.has(milestone.title)) fail(`Duplicate milestone: ${milestone.title}`);
  milestoneTitles.add(milestone.title);

  if (!/^Sprint [0-5]: .+/.test(milestone.title)) fail(`Milestone title is not "Sprint N: Theme": ${milestone.title}`);
  if (!milestone.description || milestone.description.split('\n').length < 3) {
    fail(`Milestone "${milestone.title}" needs a 3–5 line description.`);
  }

  const due = Date.parse(milestone.due_on);
  if (Number.isNaN(due)) fail(`Milestone "${milestone.title}" has an invalid due_on.`);
  if (due <= previousDue) fail(`Milestone "${milestone.title}" is not in chronological order.`);
  previousDue = due;
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

if (issues.length !== EXPECTED_ISSUES) {
  fail(`Expected ${EXPECTED_ISSUES} issues, found ${issues.length}.`);
}

const keys = new Set();
const titles = new Set();
const dependencyMap = new Map();

for (const issue of issues) {
  const where = issue.key || issue.title;

  if (!/^S[0-5]-[1-5]$/.test(issue.key)) fail(`${where}: key must match S<0-5>-<1-5>.`);
  if (keys.has(issue.key)) fail(`Duplicate issue key: ${issue.key}`);
  keys.add(issue.key);

  if (titles.has(issue.title)) fail(`Duplicate issue title: ${issue.title}`);
  titles.add(issue.title);

  const tag = issue.title.match(/^\[([^\]]+)\]/)?.[1];
  if (!TAGS.includes(tag)) fail(`${where}: title must start with [${TAGS.join('|')}].`);

  if (!milestoneTitles.has(issue.milestone)) fail(`${where}: unknown milestone "${issue.milestone}".`);

  if (!(issue.estimateHours > 0)) fail(`${where}: estimate must be positive.`);
  if (issue.estimateHours > 4) fail(`${where}: estimate ${issue.estimateHours} h exceeds one working day for this plan.`);

  const priorities = issue.labels.filter((label) => label.startsWith('priority:'));
  if (priorities.length !== 1) fail(`${where}: must have exactly one priority label, found ${priorities.length}.`);

  for (const label of issue.labels) {
    if (!labelNames.has(label)) fail(`${where}: unknown label "${label}".`);
  }

  if (!issue.body.includes('## What')) fail(`${where}: body is missing "## What".`);
  if (!issue.body.includes('## Why')) fail(`${where}: body is missing "## Why".`);
  if (!issue.body.includes('## Acceptance Criteria')) fail(`${where}: body is missing "## Acceptance Criteria".`);
  const checkboxes = (issue.body.match(/- \[ \]/g) || []).length;
  if (checkboxes < 3) fail(`${where}: needs at least three acceptance criteria, found ${checkboxes}.`);

  dependencyMap.set(issue.key, issue.dependsOn);
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

for (const [key, dependencies] of dependencyMap) {
  for (const dependency of dependencies) {
    if (dependency === key) fail(`${key}: depends on itself.`);
    if (!keys.has(dependency)) fail(`${key}: depends on unknown issue "${dependency}".`);
  }
}

const visiting = new Set();
const visited = new Set();

function visit(key, trail) {
  if (visited.has(key)) return;
  if (visiting.has(key)) {
    fail(`Dependency cycle: ${[...trail, key].join(' → ')}`);
    return;
  }
  visiting.add(key);
  for (const dependency of dependencyMap.get(key) || []) visit(dependency, [...trail, key]);
  visiting.delete(key);
  visited.add(key);
}

for (const key of dependencyMap.keys()) visit(key, []);

// ---------------------------------------------------------------------------
// Sprint allocation
// ---------------------------------------------------------------------------

for (const milestone of milestones) {
  const sprintIssues = issues.filter((issue) => issue.milestone === milestone.title);
  if (sprintIssues.length !== ISSUES_PER_SPRINT) {
    fail(`${milestone.title}: expected ${ISSUES_PER_SPRINT} issues, found ${sprintIssues.length}.`);
  }
  const hours = sprintIssues.reduce((sum, issue) => sum + issue.estimateHours, 0);
  if (hours !== HOURS_PER_SPRINT) {
    fail(`${milestone.title}: expected ${HOURS_PER_SPRINT} h planned, found ${hours} h.`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`Plan validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

const totalHours = issues.reduce((sum, issue) => sum + issue.estimateHours, 0);
console.log('Plan validation passed.');
console.log(`  ${labels.length} labels`);
console.log(`  ${milestones.length} milestones`);
console.log(`  ${issues.length} issues, ${totalHours} h planned`);
console.log(`  ${issues.filter((issue) => issue.dependsOn.length > 0).length} issues with dependencies, no cycles`);
