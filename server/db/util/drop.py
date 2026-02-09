import sqlite3

DB_NAME = "reeltone.db"  # Use the same DB name as in createTables()

def dropTables():
    """
    Drops all necessary tables from the database.
    """
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    tables = ["followers", "watched", "watchlist", "likes", "reviews", "users"]
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
        print(f"{table.capitalize()} table dropped.")

    conn.commit()
    conn.close()
    print("✅ All tables dropped successfully.")
