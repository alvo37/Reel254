from util.create import createTables
from util.drop import dropTables

def initialize():
    """
    Initializes the database by dropping existing tables and creating new ones.
    """
    dropTables()
    createTables()
    print("Database initialized successfully.")

if __name__ == "__main__":
    initialize()
    print("Database setup complete.")