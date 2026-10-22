import json
import logging

import azure.functions as func

from plans_table import get_plans_table

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

PLAN_FIELDS = ("name", "eyebrow", "price", "allowance", "unit", "detail")


# GET /api/plans: returns { "mobile": [...], "fiber": [...] } from the Plans table.
# Each row: PartitionKey = category, RowKey = display order ("01", "02", ...).
@app.route(route="plans", methods=["GET"])
def plans(req: func.HttpRequest) -> func.HttpResponse:
    try:
        result = {"mobile": [], "fiber": []}
        rows = sorted(get_plans_table().list_entities(), key=lambda row: row["RowKey"])

        for row in rows:
            category = result.get(row["PartitionKey"])
            if category is None:
                continue
            plan = {field: row.get(field) for field in PLAN_FIELDS}
            plan["features"] = json.loads(row.get("features") or "[]")
            if row.get("featured"):
                plan["featured"] = True
            category.append(plan)
        return json_response(result)
    except Exception:
        logging.exception("Could not read the Plans table")
        return json_response({"error": "Could not load plans"}, status_code=500)


def json_response(body: dict, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(body), status_code=status_code, mimetype="application/json"
    )
