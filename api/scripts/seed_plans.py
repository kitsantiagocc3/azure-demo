# Loads data/plans.json into the Plans table (Azurite locally). Safe to run again:
# each plan's row is replaced, but rows for plans removed from the file are not deleted.
import json
import os
import sys
from pathlib import Path

from azure.core.exceptions import ResourceExistsError
from azure.data.tables import UpdateMode

API_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_DIR))

from plans_table import TABLE_NAME, get_plans_table  # noqa: E402

settings_path = API_DIR / "local.settings.json"
if not os.environ.get("PLANS_TABLE_CONNECTION") and settings_path.exists():
    settings = json.loads(settings_path.read_text(encoding="utf-8"))
    os.environ["PLANS_TABLE_CONNECTION"] = settings["Values"]["PLANS_TABLE_CONNECTION"]


def main() -> None:
    plans = json.loads((API_DIR / "data" / "plans.json").read_text(encoding="utf-8"))
    table = get_plans_table()
    try:
        table.create_table()
    except ResourceExistsError:
        pass

    count = 0
    for category, plan_list in plans.items():
        for index, plan in enumerate(plan_list, start=1):
            table.upsert_entity(
                {
                    "PartitionKey": category,
                    "RowKey": f"{index:02d}",
                    "name": plan["name"],
                    "eyebrow": plan["eyebrow"],
                    "price": plan["price"],
                    "allowance": plan["allowance"],
                    "unit": plan["unit"],
                    "detail": plan["detail"],
                    "features": json.dumps(plan["features"]),  # tables can't store lists
                    "featured": bool(plan.get("featured")),
                },
                mode=UpdateMode.REPLACE,
            )
            count += 1
    print(f"Seeded {count} plans into the {TABLE_NAME} table.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("Seeding failed. Is Azurite running? (npm run storage)", file=sys.stderr)
        print(error, file=sys.stderr)
        sys.exit(1)
