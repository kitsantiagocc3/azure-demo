# Relay - Next.js telecom frontend

A responsive telecommunications demo for Azure Static Web Apps training. Relay is a fictional brand. All plans, prices, and availability examples are illustrative.

Personal repository: https://github.com/kitsantiagocc3/azure-demo

## Included

- Mobile and home fiber plan switcher.
- Plan details in an accessible native dialog.
- ZIP code coverage demonstration with input validation.
- Expandable FAQs and responsive mobile navigation.
- Next.js App Router, React, TypeScript, and plain CSS.
- Static export for Azure; no Python, server, API, payments, or customer database.

The coverage checker runs entirely in the browser. It does not check live availability or send/store the ZIP code. Plan buttons show details; they do not place orders.

## Run locally

Use Node.js 24 LTS.

```powershell
cd "C:\Users\CC3 User\CC3 Training Kit\azure-demo"
npm ci
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.

```powershell
npm run build
npm run typecheck
```

`next.config.ts` sets `output: "export"`. The production site is generated in `out/`; the build also copies `public/staticwebapp.config.json` into that folder. Build the app before typechecking a fresh checkout so Next.js can generate its types.

## Deploy to Azure Static Web Apps

An **active Azure subscription** and permission to create resources are required. A tenant-level sign-in by itself is not enough. If the subscription picker is empty, ask your administrator which training subscription/resource group you can use; do not select a paid plan just to continue.

1. Open Azure Portal > Create a resource > Static Web App > Create.
2. Select your authorized training subscription and resource group.
3. Use app name `azure-demo` and plan **Free**. Select an available region.
4. Choose GitHub as the source and sign in with your personal GitHub account.
5. In the owner/organization dropdown select **kitsantiagocc3** (your personal account), repository **azure-demo**, branch **main**.
6. Use **Custom** build preset with these settings:

   | Setting         | Value       |
   | --------------- | ----------- |
   | App location    | `/`         |
   | API location    | Leave empty |
   | Output location | `out`       |

7. Review and create. Azure adds its deployment workflow and deployment secret to GitHub automatically. Do not paste a deployment token into source code or chat.
8. Pull the new workflow with `git pull --ff-only origin main`. In the generated `.github/workflows/azure-static-web-apps-*.yml`, keep the generated secret reference and set the deployment step to:

   ```yaml
   with:
     # Keep the other generated inputs, including the deployment token reference.
     app_location: "/"
     api_location: ""
     output_location: "out"
     app_build_command: "npm run build"
   env:
     IS_STATIC_EXPORT: true
   ```

9. Commit and push that workflow change. Wait for the Azure deployment workflow in GitHub > Actions to succeed, then open Azure > your Static Web App > Overview > URL.

The included `frontend.yml` only verifies the frontend build. A successful frontend check does **not** mean the site has been deployed. Azure's separate generated workflow handles deployment after the resource exists.

No Azure resource or public site is created by running the local build. Add an Azure Functions API later as a separate exercise; Next.js server features and API routes are not part of this static export.

## Next stage: load plans from Azure

Proposed training architecture: browser > `/api/plans` > managed Azure Function > Azure Table Storage. This stage has not been implemented or provisioned; the current page uses illustrative plan data in `app/page.tsx`.

1. Confirm an active training subscription in Azure Portal > Subscriptions.
2. Create or use an authorized storage account, then open Storage Browser > Tables > Add table and name it `Plans`.
3. Use Add entity for each example plan. Use `PartitionKey` = `mobile` or `fiber`, and a stable `RowKey` such as `everyday` or `home-together`. Add fields for name, price (number), currency, allowance, unit, eyebrow, detail, and featured (boolean). Store the features list as a JSON string property named `featuresJson`; Azure Table Storage properties do not store arrays directly.
4. Add a Node.js/TypeScript HTTP Azure Function in a separate `api/` folder. A proposed read-only endpoint is `GET /api/plans?category=mobile` (or `fiber`). It reads the matching rows, parses `featuresJson` into a `features` array, and returns public plan details as JSON.
5. Configure database access in backend application settings. Keep credentials out of browser code, Git, and `NEXT_PUBLIC_*` variables.
6. Replace the frontend's hardcoded list with a browser-side fetch to that endpoint. Include loading, error, and empty states. A static Next.js export can load API data after the page opens.
7. Set the Azure deployment workflow's API location to `api` when that folder is ready, configure a supported managed Functions runtime, and deploy. Database edits can then appear after the next request without rebuilding the frontend.

Suggested response shape:

```json
{
  "data": [
    {
      "id": "mobile-everyday",
      "category": "mobile",
      "name": "The everyday",
      "eyebrow": "A little of everything",
      "price": 20,
      "currency": "USD",
      "allowance": "15",
      "unit": "GB",
      "detail": "For maps, messages, and your daily soundtrack.",
      "features": ["15 GB of mobile data", "Unlimited talk & text"],
      "featured": false
    }
  ]
}
```

This proposal covers public plan information only. Customer accounts, orders, payments, and real coverage queries require separate design and authorization.

## Project structure

```text
app/                         Page, layout, styles, and icon
public/staticwebapp.config.json
.github/workflows/frontend.yml
next.config.ts               Next.js static export configuration
package-lock.json            Reproducible dependency versions
out/                         Generated by npm run build; ignored by Git
```

## References

- [Microsoft: Deploy static-rendered Next.js websites](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs-static-export)
- [Microsoft: Static Web Apps build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Next.js: Static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Microsoft: Create a table and add entities in Azure Portal](https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-quickstart-portal)
- [Microsoft: Azure Functions APIs in Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-functions)
