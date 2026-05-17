import sqlite3

conn = sqlite3.connect("task_depot.db")
try:
    conn.execute("ALTER TABLE tasks ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]'")
    conn.commit()
    print("✓ Added tags_json column")
except sqlite3.OperationalError as e:
    if "duplicate column" in str(e):
        print("Column already exists, nothing to do.")
    else:
        raise
finally:
    conn.close()