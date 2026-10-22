const { TableClient } = require("@azure/data-tables");

const TABLE_NAME = "Plans";

// Azurite runs on plain http, so the SDK must be told that is allowed
function getPlansTable() {
  const connection = process.env.PLANS_TABLE_CONNECTION;
  if (!connection) throw new Error("PLANS_TABLE_CONNECTION is not set");
  return TableClient.fromConnectionString(connection, TABLE_NAME, {
    allowInsecureConnection: connection.includes("UseDevelopmentStorage"),
  });
}

module.exports = { getPlansTable, TABLE_NAME };
