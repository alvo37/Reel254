import os
import sqlite3

def get_db_connection(base_dir):
    """
    Connects to the database given a base directory.
    Args:
        base_dir (str): The absolute path to the directory from which
                        the 'db' directory can be found (e.g., '/path/to/server').
    """
    db_path = os.path.join(base_dir, 'db', 'reeltone.db')
    print(f"Helper trying to connect to: {db_path}")
    conn = sqlite3.connect(db_path)
    return conn