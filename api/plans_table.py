import os

from azure.data.tables import TableClient

TABLE_NAME = "Plans"


def get_plans_table() -> TableClient:
    connection = os.environ.get("PLANS_TABLE_CONNECTION")
    if not connection:
        raise RuntimeError("PLANS_TABLE_CONNECTION is not set")
    return TableClient.from_connection_string(connection, table_name=TABLE_NAME)
