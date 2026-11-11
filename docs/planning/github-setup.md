# GitHub Setup — from empty folder to a working backlog

Everything here is PowerShell on Windows, because that is the environment. `gh` is **not** installed, so the setup uses plain `git` plus `scripts/setup-github.mjs` calling the REST API with Node 20's built-in `fetch`.

Run the steps in order. Steps 1–4 are one-time. Step 6 is the only one that writes to GitHub.

---

## 0. Prerequisites

| Requirement | Check |
|---|---|
| Node 20 or newer | `node --version` |
| Git | `git --version` |
| A GitHub account | — |
| This repository initialized locally | `git -C . status` shows `main` |

---

## 1. Create the empty repository on GitHub

1. Open <https://github.com/new>.
2. **Repository name:** `mihak`
3. **Owner:** your account.
4. **Visibility:** private (switch to public only when you want to share the demo).
5. **Do not** add a README, `.gitignore`, or license. The local repository already has them; an initialized remote causes a divergent first push.

Click **Create repository**. Copy the HTTPS URL, for example `https://github.com/<owner>/mihak.git`.

> The setup script does **not** create the repository. It only writes labels, milestones, and issues into an existing one.

---

## 2. Add the remote and push `main`

```powershell
Set-Location "C:\Users\Raed Alhallaq\Desktop\mihak"
git remote add origin https://github.com/<owner>/mihak.git
git remote -v
git push -u origin main
```

Expected: `branch 'main' set up to track 'origin/main'`.

If the remote already exists:

```powershell
git remote set-url origin https://github.com/<owner>/mihak.git
```

---

## 3. Create the personal access token

The script needs to create issues and milestones. Choose **one** of these:

### Option A — classic token (simplest)

1. <https://github.com/settings/tokens/new>
2. Note: `mihak setup`
3. Expiration: 30 days.
4. Scopes: **`repo`** only. Add `project` only if you later script the Project board; the provided script does not need it.
5. Generate and copy the token once. It starts with `ghp_`.

### Option B — fine-grained token (least privilege)

1. <https://github.com/settings/personal-access-tokens/new>
2. Repository access: **Only select repositories** → `mihak`.
3. Permissions:
   - **Issues:** Read and write
   - **Contents:** Read and write
   - **Metadata:** Read (mandatory, auto-selected)
4. Generate and copy.

---

## 4. Store the token where the script can find it

The script tries, in order:

1. `GITHUB_TOKEN`
2. `GH_TOKEN`
3. `git credential fill` for `host=github.com`

### 4.1 Recommended: store it with Git Credential Manager

```powershell
$token = Read-Host "Paste GitHub token" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)
@"
protocol=https
host=github.com
username=<your-github-username>
password=$plain
"@ | git credential approve
Remove-Variable plain, token
```

Verify without printing the secret:

```powershell
git credential fill
# type these two lines, then Enter twice:
# protocol=https
# host=github.com
# The output must contain username=... and password=...
```

If your machine uses a browser-based credential manager, the first `git push` in step 2 already stored a usable token. Check with the same `git credential fill` command.

### 4.2 Alternative: environment variable for one session

```powershell
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx"
```

This disappears when the terminal closes. Never commit a token, never put one in `.env` that is tracked.

---

## 5. Verify the script before it writes anything

```powershell
Set-Location "C:\Users\Raed Alhallaq\Desktop\mihak"
node scripts/setup-github.mjs --repo <owner>/mihak --dry-run
```

Expected output:

```
Repository: <owner>/mihak
Mode: dry-run (no writes)
Summary
  Labels:     20 created, 0 updated, 0 unchanged
  Milestones: 6 created, 0 updated, 0 unchanged
  Issues:     30 created, 0 updated, 0 unchanged
```

In dry-run, issue numbers show `(dry-run)` and dependencies stay as `{{S0-1}}` placeholders. That is expected.

If it fails:

| Message | Cause | Fix |
|---|---|---|
| `Could not determine the repository` | No `--repo`, no `GITHUB_REPOSITORY`, no GitHub origin | Pass `--repo owner/mihak`. |
| `No GitHub token found` | No env var and no stored credential | Redo step 4. |
| `401 Bad credentials` | Token expired or mistyped | Regenerate. |
| `404 Not Found` on a write | Token cannot see the repo | Check token scope and repository selection. |
| `403 Resource not accessible by personal access token` | Missing **Issues: write** | Add the permission. |

---

## 6. Run the setup

```powershell
node scripts/setup-github.mjs --repo <owner>/mihak
```

What it does, idempotently:

1. Reads the authenticated user and assigns every issue to that account.
2. Creates or updates the 20 labels (name, color, description).
3. Creates or updates the 6 milestones (title, description, due date).
4. Creates or updates the 30 issues (title, body, labels, milestone, assignee), matching by exact title.
5. Appends a `## Dependencies` section with real `#N` references.
6. Prints a summary and the issue list.

Re-running is safe: unchanged objects are counted as `unchanged`, changed ones are patched, nothing is duplicated. Do **not** rename issue titles after this point — the title is the matching key.

Record the summary in `docs/journal/2026-11-12.md`.

Expected end state:

- <https://github.com/<owner>/mihak/labels> → 20 labels.
- <https://github.com/<owner>/mihak/milestones> → 6 milestones with due dates 11-18 … 12-23.
- <https://github.com/<owner>/mihak/issues> → 30 issues, all assigned, five per milestone.

---

## 7. Project board

Two paths: a script for the parts the API supports, and the UI for the parts it does not.

### 7.1 Automated path (recommended)

`scripts/setup-project.mjs` creates the project, renames the Status options to the six columns, creates a Board view, adds all 30 issues, and files each new item under `Backlog`. It is idempotent.

It needs a token with the **`project`** scope, which the default git credential usually lacks:

1. Create a classic token with `repo` + `project`:
   <https://github.com/settings/tokens/new?scopes=repo,project&description=mihak-project>
2. Save it once, outside the repository:
   ```powershell
   New-Item -ItemType Directory -Force "$env:USERPROFILE\.mihak" | Out-Null
   $t = Read-Host "Paste the token" -AsSecureString
   [Runtime.InteropServices.Marshal]::PtrToStringAuto(
     [Runtime.InteropServices.Marshal]::SecureStringToBSTR($t)
   ) | Set-Content "$env:USERPROFILE\.mihak\github-token" -NoNewline
   ```
3. Preview, then apply:
   ```powershell
   node scripts/setup-project.mjs --dry-run
   node scripts/setup-project.mjs
   ```

Token resolution order: `GITHUB_TOKEN`, `GH_TOKEN`, `--token-file`, `MIHAK_TOKEN_FILE`, `~/.mihak/github-token`, then `git credential fill`.

**What the API cannot do — finish these in the UI:**

- Set the `In Progress` column limit to **2**.
- Enable the workflows `Item closed → Done`, `Pull request merged → Done`, `Pull request linked to issue → In Review`, `Item reopened → In Progress`.
- Confirm the Board view groups by `Status`. If it does not, open the view menu → **Group by** → `Status`.

### 7.2 Manual path (fallback)

1. Repository → **Projects** → **New project** → template **Board**.
2. Name: `Mihak`.
3. Rename the default columns in order:
   - `Backlog`
   - `Ready`
   - `In Progress`
   - `In Review`
   - `Done`
   - plus `Blocked` (drag it after `In Progress` or keep it at the end; either is fine as long as it exists)
4. **Add items:** Project menu → **Add item** → search `is:issue` and add all 30. Or use the repository issue list → select all → **Projects** → `Mihak`.
5. **Workflows** (Project → `...` → **Workflows**):
   - `Item closed` → **Done** ✅
   - `Pull request merged` → **Done** ✅
   - `Pull request linked to issue` → **In Review** ✅
   - `Item reopened` → **In Progress** ✅
6. **WIP limit:** open the `In Progress` column menu → **Set limit** → `2`.
7. **Sort:** group by `Milestone`, sort by `Created` ascending inside each group.

### Column rules

| Column | Entry rule | Exit rule |
|---|---|---|
| Backlog | Default for every new issue. | Acceptance criteria written, estimate set, dependencies identified. |
| Ready | Meets Definition of Ready. | You start work. |
| In Progress | You are actively working; max 2. | A PR is open. |
| In Review | PR open and CI running. | PR merged or closed. |
| Blocked | A real dependency is unresolved; the issue also carries the `blocked` label. | Dependency closed, then back to Ready. |
| Done | PR merged, CI green, deployed or demonstrably runnable. | — |

**WIP rule:** do not open a new issue before the current one has a merged PR. The board is the anti-multitasking device, not a report.

---

## 8. Branch protection (manual — needs the UI)

Settings → **Branches** → **Add branch protection rule**.

### 8.1 Protect `dev`

Pattern: `dev`

| Setting | Value |
|---|---|
| Require a pull request before merging | ✅ |
| Require approvals | ❌ (solo — CI and self-review replace it) |
| Dismiss stale approvals | ❌ (no approvals) |
| Require review from Code Owners | ❌ |
| Require status checks to pass before merging | ✅ |
| Require branches to be up to date before merging | ✅ |
| Status checks | the CI job name, usually `ci` (see `.github/workflows/ci.yml`) |
| Require conversation resolution before merging | ✅ |
| Require signed commits | optional |
| Require linear history | ❌ **disabled on purpose** |
| Require deployments to succeed | ❌ |
| Lock branch | ❌ |
| Do not allow bypassing the above settings | ✅ |
| Allow force pushes | ❌ |
| Allow deletions | ❌ |

> **Deviation from EchoGrow, recorded deliberately:** the reference text asks for normal merge commits *and* linear history. Those are mutually exclusive: linear history forbids merge commits. Merge commits win, because the reference also requires `Merge pull request #N ...` and forbids squash-only history.

### 8.2 Protect `main`

Pattern: `main`, same settings, plus:

| Setting | Value |
|---|---|
| Require a pull request before merging | ✅ |
| Require status checks | ✅ same `ci` job |
| Restrict who can push | optional — on a personal repo this means only you, which is already true |

Flow: `feat/*` → PR → `dev` → release PR → `main`. Because `main` only accepts merges from `dev`, the release PR is the only thing that lands there, and tagging happens on `main`.

### 8.3 Verify

```powershell
git checkout dev
git commit --allow-empty -m "chore: verify protection"
git push
# Must be rejected: "You're not allowed to push code to protected branches"
git reset --hard HEAD~1
```

If the push succeeds, protection was not saved or the rule pattern does not match `dev`.

---

## 9. Branch and PR ritual

```powershell
# start from an up-to-date dev
git checkout dev
git pull origin dev
git checkout -b feat/create-run-endpoint

# work, commit in small steps
git add .
git commit -m "feat(api): validate and queue runs"

# sync every two days
git pull --rebase origin dev

# push and open the PR against dev
git push -u origin feat/create-run-endpoint
```

PR title: `feat(api): create run endpoint (#12)`
PR base: `dev` — never `main`.
PR body: `.github/PULL_REQUEST_TEMPLATE.md` is applied automatically.
Merge: **Create a merge commit**. Then delete the branch.

Direct pushes to `dev` and `main` are forbidden even when working alone. The only exceptions are the initial push in step 2 and, if you ever need it, an explicit temporary unprotect that must be re-enabled in the same session.

---

## 10. Daily and sprint cadence

| When | Action |
|---|---|
| Every working day | 2–3 lines in `docs/journal/YYYY-MM-DD.md`: done / next / stuck. |
| Every PR | Template filled, CI green, self-review checklist ticked. |
| End of sprint | `docs/planning/sprint-retro.md` gets a new section: planned vs done, 3 wins, 3 fixes; unfinished issues move to the top of the next sprint. |

---

## 11. Troubleshooting the script

**`fetch failed` / `ENOTFOUND`** — network or proxy. Check `Invoke-WebRequest https://api.github.com` works.

**Rate limited** — the script waits and retries up to three times when `x-ratelimit-remaining` is `0`. Unauthenticated requests are not used; if you see this, the token is probably invalid and the API is treating you as anonymous.

**Labels created but issues fail** — read the thrown `POST /repos/.../issues -> 422` message. Usually it is a label name typo or a milestone number that no longer exists. Fix the data file, re-run; the script is idempotent.

**Issue body has `{{S0-1}}` left** — the dependency key does not exist in `github-data.mjs`, or the run was a dry run. Fix the key and re-run without `--dry-run`.

**Duplicate issues** — only possible if titles changed between runs. The script matches on exact title. Close the duplicates and keep the canonical title.

---

## 12. Verification checklist

- [ ] `git remote -v` shows `origin` pointing at `owner/mihak`.
- [ ] `main` is pushed and `dev` exists on the remote.
- [ ] 20 labels exist with the exact colors.
- [ ] 6 milestones exist with due dates 2026-11-18 … 2026-12-23.
- [ ] 30 issues exist, all assigned, `blocked` present on every issue that has dependencies.
- [ ] Every issue body has `## What`, `## Why`, `## Acceptance Criteria`, and a `## Dependencies` section when applicable.
- [ ] Project board has six columns and the four workflows.
- [ ] `dev` rejects a direct push.
- [ ] CI runs on a test PR and its check name matches the protected-branch requirement.
