const { app } = require("@azure/functions");
const { getPlansTable } = require("../plansTable");

// GET /api/plans: returns { mobile: [...], fiber: [...] } from the Plans table.
// Each row: PartitionKey = category, RowKey = display order ("01", "02", ...).
app.http("plans", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "plans",
  handler: async (request, context) => {
    try {
      const plans = { mobile: [], fiber: [] };
      const rows = [];
      for await (const row of getPlansTable().listEntities()) rows.push(row);
      rows.sort((a, b) => a.rowKey.localeCompare(b.rowKey));

      for (const row of rows) {
        if (!plans[row.partitionKey]) continue;
        plans[row.partitionKey].push({
          name: row.name,
          eyebrow: row.eyebrow,
          price: row.price,
          allowance: row.allowance,
          unit: row.unit,
          detail: row.detail,
          features: JSON.parse(row.features ?? "[]"),
          ...(row.featured ? { featured: true } : {}),
        });
      }
      return { jsonBody: plans };
    } catch (error) {
      context.error("Could not read the Plans table", error);
      return { status: 500, jsonBody: { error: "Could not load plans" } };
    }
  },
});
