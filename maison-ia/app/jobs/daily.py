"""Optional external scheduler: enqueue only, never bypass the daily limit."""
from datetime import datetime
from zoneinfo import ZoneInfo
from ..db import init_db
from ..queue import enqueue
if __name__ == "__main__":
    init_db()
    enqueue({"id": "daily-" + datetime.now(ZoneInfo("Europe/Paris")).date().isoformat(),
             "type": "daily.briefing", "data": {}})
