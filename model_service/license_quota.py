"""Conservative shared ceiling: at most 950 inference reservations per 30 days.

Every output needs a reservation, so unique direct recipients cannot exceed the
published 1,000-user ceiling through this deployment. Failed calls still consume
a reservation. This is deliberately stricter than a count of active people.
Only UTC timestamps are stored; no identifier, transcript, question or audio.
"""
from contextlib import closing
import os
from pathlib import Path
import sqlite3
import time

LIMIT = 950
WINDOW_SECONDS = 30 * 24 * 60 * 60


def reserve_model_use(db_path, now=None):
    if not db_path:
        raise RuntimeError("Explicit shared licence database required")
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    timestamp = time.time() if now is None else now
    with closing(sqlite3.connect(path, timeout=5)) as db:
        with db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("CREATE TABLE IF NOT EXISTS reservations (created REAL NOT NULL)")
            db.execute("DELETE FROM reservations WHERE created <= ?", (timestamp - WINDOW_SECONDS,))
            if db.execute("SELECT COUNT(*) FROM reservations").fetchone()[0] >= LIMIT:
                return False
            db.execute("INSERT INTO reservations (created) VALUES (?)", (timestamp,))
    os.chmod(path, 0o600)
    return True
