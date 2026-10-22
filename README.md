# Relay - Next.js telecom frontend + Azure plans API

A responsive telecommunications demo for Azure Static Web Apps training. Relay is a fictional brand. All plans, prices, and availability examples are illustrative.

Personal repository: https://github.com/kitsantiagocc3/azure-demo

## How it fits together

```text
Browser
  │  opens the site
  ▼
Next.js static site (out/)          ← Azure Static Web Apps hosts this
  │  GET /api/plans
  ▼
Azure Function "plans" (api/)       ← managed Functions inside the Static Web App
  │  reads rows
  ▼
Azure Table Storage, table "Plans"  ← one row per plan
```

- **Frontend:** Next.js App Router, React, TypeScript and plain CSS, exported as static files (`output: "export"` → `out/`).
- **API:** one Azure Function (JavaScript, v4 programming model): `GET /api/plans` returns `{ "mobile": [...], "fiber": [...] }`.
- **Data:** Azure Table Storage, table `Plans`. `PartitionKey` = category (`mobile` / `fiber`), `RowKey` = display order (`01`, `02`, …). Features are stored as a JSON string because table properties can't hold lists.
- **No customer data:** the coverage checker runs in the browser only, and plan buttons show details; nothing is ordered, sent or stored.

## Where the frontend calls the API

All in `app/page.tsx`:

| What | Purpose |
|---|---|
| `fallbackPlans` | Built-in copy of the plans (from `api/data/plans.json`), shown immediately and if the API is unavailable |
| `API_BASE_URL` | Empty on Azure, so the site calls `/api/plans` on its own domain. Set to `http://localhost:7071` only for `npm run dev` |
| `axios.get(\`${API_BASE_URL}/api/plans\`)` | Loads the plans; on success the cards switch to the API data |
| Note under the cards | "Plans loaded from the API." or "Showing built-in plans (API not connected)." |

Same-origin `/api` means no CORS setup or API URL to manage in production: Static Web Apps routes `/api/*` to the managed Functions.

## Project structure

```text
app/                              Page, layout, styles and icon
public/staticwebapp.config.json   Static Web Apps hosting rules
api/                              Azure Functions project
  src/functions/plans.js          GET /api/plans
  src/plansTable.js               Connects to the Plans table
  scripts/seed-plans.js           Loads data/plans.json into the table
  data/plans.json                 Plan data (single source)
  host.json, package.json
  local.settings.example.json     Template; the real local.settings.json is git-ignored
.github/workflows/frontend.yml    CI: npm ci → build → typecheck → check deployable files
.env.example                      Template for the dev-only API address
next.config.ts                    Static export configuration
```

## Run locally (no Azure subscription needed)

Microsoft's local tools stand in for Azure:

| Azure service | Local stand-in |
|---|---|
| Table Storage | Azurite (storage emulator) |
| Azure Functions | Azure Functions Core Tools (`func`) |
| Static Web Apps | Static Web Apps CLI (`swa`) |

Use Node.js 24. On Windows PowerShell, if scripts are blocked, use `npm.cmd` instead of `npm`.

**One-time setup**

```powershell
cd "C:\Users\CC3 User\CC3 Training Kit\azure-demo"
npm ci
cd api
npm ci                      # approve the azure-functions-core-tools setup script if npm asks
copy local.settings.example.json local.settings.json
cd ..
copy .env.example .env.development.local
```

**Every time (three terminals)**

| Terminal | Folder | Command | Result |
|---|---|---|---|
| 1 | `api/` | `npm run storage` | Azurite on ports 10000–10002 |
| 2 | `api/` | `npm run seed` (first time) then `npm start` | API at http://localhost:7071/api/plans |
| 3 | repo root | `npm run build` then `npm run swa` | Site + API at http://localhost:4280 |

Check: http://localhost:7071/api/plans returns the plans JSON (also works in Postman), and http://localhost:4280 shows "Plans loaded from the API." under the cards.

For live editing, run `npm run dev` instead of terminal 3 and open http://localhost:3000; it calls the API directly on port 7071 (CORS for that is set in `local.settings.json`).

**Changing plan data:** edit `api/data/plans.json`, then `npm run seed`, then refresh. The API reads the table, not the JSON file. Seeding adds and updates rows; it doesn't delete rows removed from the file.

Stop the servers (Ctrl+C) before switching git branches; the Functions host recreates `api/host.json` if it disappears.

## Deploy to Azure Static Web Apps

Requires an active Azure subscription and permission to create resources in the chosen resource group. Use the **Free** plan.

1. **Static Web App:** Azure Portal (or VS Code: *Static Web Apps: Create Static Web App... (Advanced)*, with this repository opened as the workspace folder).

   | Setting | Value |
   |---|---|
   | Plan | Free |
   | Source | GitHub, owner **kitsantiagocc3**, repository **azure-demo**, branch **main** |
   | Build preset | Next.js (static export) or Custom |
   | App location | `/` |
   | API location | `api` |
   | Output location | `out` |

   Azure adds its deployment workflow (`.github/workflows/azure-static-web-apps-*.yml`) and a deployment secret to GitHub. Pull it afterwards with `git pull --ff-only origin main`. Never paste the deployment token into code or chat.

2. **Storage:** create a storage account in the same resource group (Standard, LRS), then **Storage browser → Tables → Add table** → `Plans`.

3. **Load the plans** from a local terminal, then clear the variable:

   ```powershell
   cd api
   $env:PLANS_TABLE_CONNECTION = "<storage account connection string>"
   npm run seed
   Remove-Item Env:PLANS_TABLE_CONNECTION
   ```

4. **Connect the API:** Static Web App → **Settings → Environment variables** → add `PLANS_TABLE_CONNECTION` = the storage connection string. This is the only difference between local and Azure.

5. **Test:** open the Static Web App URL (the site should say "Plans loaded from the API."), and `<URL>/api/plans` should return the plans JSON.

The connection string is a secret: keep it only in Azure's environment variables (and in the git-ignored `local.settings.json` if you ever test against real storage). Never put it in code, `NEXT_PUBLIC_*` variables or commits.

The included `frontend.yml` only verifies the frontend build. Azure's separate generated workflow handles deployment.

## Status

| Piece | Status |
|---|---|
| Frontend (static export) | Done; CI build and typecheck pass |
| API `GET /api/plans` | Done; tested locally |
| Table Storage `Plans` | Done; tested locally with Azurite |
| Site + API together (SWA CLI) | Tested end to end locally |
| Azure deployment | Pending |

## References

- [Microsoft: Deploy static-rendered Next.js websites](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs-static-export)
- [Microsoft: Add an API to Static Web Apps with Azure Functions](https://learn.microsoft.com/en-us/azure/static-web-apps/add-api)
- [Microsoft: Static Web Apps build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Microsoft: Develop Azure Functions locally](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local)
- [Microsoft: Use Azurite for local storage development](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite)
- [Microsoft: Create a table and add entities in Azure Portal](https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-quickstart-portal)
- [Next.js: Static exports](https://nextjs.org/docs/app/guides/static-exports)
