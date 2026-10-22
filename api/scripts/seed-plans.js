// Loads data/plans.json into the Plans table (Azurite locally). Safe to run again:
// rows are upserted, so the table always matches the file.
const fs = require("fs");
const path = require("path");
const { getPlansTable, TABLE_NAME } = require("../src/plansTable");
const plans = require("../data/plans.json");

const settingsPath = path.join(__dirname, "..", "local.settings.json");
if (!process.env.PLANS_TABLE_CONNECTION && fs.existsSync(settingsPath)) {
  process.env.PLANS_TABLE_CONNECTION = JSON.parse(
    fs.readFileSync(settingsPath, "utf8"),
  ).Values.PLANS_TABLE_CONNECTION;
}

async function main() {
  const table = getPlansTable();
  await table.createTable(); // no error if it already exists

  let count = 0;
  for (const [category, list] of Object.entries(plans)) {
    for (const [index, plan] of list.entries()) {
      await table.upsertEntity({
        partitionKey: category,
        rowKey: String(index + 1).padStart(2, "0"),
        name: plan.name,
        eyebrow: plan.eyebrow,
        price: plan.price,
        allowance: plan.allowance,
        unit: plan.unit,
        detail: plan.detail,
        features: JSON.stringify(plan.features), // tables can't store lists
        featured: Boolean(plan.featured),
      });
      count++;
    }
  }
  console.log(`Seeded ${count} plans into the ${TABLE_NAME} table.`);
}

main().catch((error) => {
  console.error("Seeding failed. Is Azurite running? (npm run storage)");
  console.error(error.message);
  process.exit(1);
});
