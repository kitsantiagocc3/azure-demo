# Relay (azure-demo): guidance for coding agents

Fictional telecom site for Azure Static Web Apps training. All plans and prices are made up. Owner: `kitsantiagocc3` (personal GitHub).

## Branch state (2026-10-22)

- PR #4 (`chore/azure-deploy-setup`) was merged into `main` on 2026-10-22.
- `main` now has the **Python 3.11** API described below (`api/function_app.py`).
- The paths and commands below apply to this Python implementation.
- Leftover untracked `api/package.json` and `api/package-lock.json` are old Node files. Don't commit them.

## Before changing anything

Do a read-only baseline:
1. `git status --short --branch` and `git log -1 --oneline`.
2. Read the README and `package.json` scripts.
3. Read the API entry that's actually on disk.
4. Check `py -3.11 --version`.

Then report which implementation is present and which commands apply. Don't switch branches while servers are running.

## Development workflow

- Start with the requested outcome, a fictional example, available tools, and boundaries. Use synthetic data only.
- Before generating files, give a brief three-step plan and identify missing requirements.
- Build one small working part at a time. Explain unfamiliar lines, keep changes easy to review, and avoid unrelated features.
- Before running generated code, inspect its file operations, network addresses, dependencies, and commands.
- Run focused checks and compare the observed behavior with the requirements. Generated output and code review alone do not prove that the app works.

## Frontend workflow

- Use the **Sites skill** (`sites:sites`) and applicable Sites tools when creating or changing the frontend.
- Preserve this project's Next.js static export, Python API, file structure, dependency limits, and Azure Static Web Apps hosting target.
- For local-only work, follow the skill's local-only workflow and skip Site registration, source synchronization, and publication.
- Hosting changes, Azure resources, and deployment still require the existing approval process. Using Sites does not grant deployment approval.

## Layout

```text
app/                              Next.js page, layout, styles (page.tsx calls /api/plans with axios)
public/staticwebapp.config.json   SWA rules; API runtime python:3.11
api/                              Azure Functions, Python v2 model
  function_app.py                 GET /api/plans
  plans_table.py                  Table Storage client (env PLANS_TABLE_CONNECTION)
  scripts/seed_plans.py           Loads data/plans.json into the Plans table
  data/plans.json                 Plan data; also the frontend's built-in fallback
tools/                            Local-only emulators (Azurite, func, SWA CLI); never used by CI/Azure
.github/workflows/frontend.yml    CI: Next.js build + typecheck, Python API import check
```

## Commands (run from this folder; on Windows use npm.cmd)

| Task | Command |
|---|---|
| Install | `npm ci`, `npm run tools:install`, `npm run api:install` (creates `api/.venv` with Python 3.11) |
| Local settings | `copy api\local.settings.example.json api\local.settings.json` |
| Storage emulator | `npm run storage` (ports 10000–10002) |
| Load data | `npm run seed` |
| API | `npm run api` → http://localhost:7071/api/plans |
| Site + API | `npm run build`, then `npm run swa` → http://localhost:4280 |
| Live editing | `npm run dev` → http://localhost:3000 |
| Checks | `npm run typecheck`, `npm run build`, and in `api/`: `.venv\Scripts\python -c "import function_app"` |

## Conventions

- Frontend: Next.js static export (`output: "export"`, output folder `out`). No server-side Next.js features.
- API: Python 3.11 only (the newest SWA managed functions support). Keep the `/api/plans` response shape `{ "mobile": [...], "fiber": [...] }`.
- Table: PartitionKey = category, RowKey = display order (`01`, `02`, …); `features` is stored as a JSON string.
- The only difference between local and Azure is the `PLANS_TABLE_CONNECTION` setting.
- Branch per change, then a PR to `main`. Commit as kitsantiagocc3 with no AI attribution lines.

## API contract: GET /api/plans

- Anonymous; no query or body.
- Returns `{ "mobile": [...], "fiber": [...] }`: 6 fictional plans with `name`, `eyebrow`, `price`, `allowance`, `unit`, `detail`, `features[]`, and optional `featured`.
- On failure: 500 `{"error":"Could not load plans"}`.
- Read-only: the handler never writes.
- The frontend switches to API data only if **both** arrays are non-empty. Otherwise it silently shows the built-in fallback, so **visible cards don't prove the API works**. Check the note under the cards ("Plans loaded from the API.") and the browser Network tab.

## Careful

- **Seeding is a write.** Confirm `PLANS_TABLE_CONNECTION` points at Azurite (or approved dev storage) before `npm run seed`. Seeding upserts and **never deletes** removed plans.
- **Keep existing local files.** Create `local.settings.json` and `.env.development.local` from their examples only if they're missing.
- Port 7071 is shared with the Friday order-preview exercise.

## Never

- Commit `api/local.settings.json`, `.env*` files (except `.env.example`), connection strings or keys.
- Put secrets in `NEXT_PUBLIC_*` variables. They end up in the browser.
- Add Node files back into `api/`. It's a Python project now.

## Done when

- `npm run typecheck` and `npm run build` pass, and `out/index.html` plus `out/staticwebapp.config.json` exist.
- The Python API imports cleanly. If the API changed: `/api/plans` returns 200 with 6 plans locally, and the site shows "Plans loaded from the API."
- The README is updated if commands or structure changed.
