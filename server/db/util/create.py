import sqlite3

DB_NAME = "reeltone.db"  # Single source of truth for DB filename

def createUsersTable(cursor):
    cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            pfp_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Users table created.")

def createReviewsTable(cursor):
    cursor.execute("DROP TABLE IF EXISTS reviews")
    cursor.execute("""
        CREATE TABLE reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            pfp_url TEXT,
            film_id INTEGER NOT NULL,
            film_title TEXT NOT NULL,
            film_poster TEXT,
            rating REAL CHECK(rating >= 0 AND rating <= 10),
            review_text TEXT,
            is_parent BOOLEAN DEFAULT FALSE,
            parent_id INTEGER,  -- for replies
            like_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- created_at will be set to the current timestamp by default
        )
    """)
    print("Reviews table created.")

def createLikesTables(cursor):
    # Drop existing tables if they exist
    cursor.execute("DROP TABLE IF EXISTS review_likes")
    cursor.execute("DROP TABLE IF EXISTS film_likes")

    # Table for likes on reviews
    cursor.execute("""
        CREATE TABLE review_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            review_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, review_id)
        )
    """)
    print("Review likes table created.")

    # Table for likes on films
    cursor.execute("""
        CREATE TABLE film_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            film_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, film_id)
        )
    """)
    print("Film likes table created.")


def createWatchlistTable(cursor):
    cursor.execute("DROP TABLE IF EXISTS watchlist")
    cursor.execute("""
        CREATE TABLE watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            film_id INTEGER NOT NULL,
            film_title TEXT,
            film_poster TEXT,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, film_id)
        )
    """)
    print("Watchlist table created.")

def createWatchedTable(cursor):
    cursor.execute("DROP TABLE IF EXISTS watched")
    cursor.execute("""
        CREATE TABLE watched (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            film_id INTEGER NOT NULL,
            film_title TEXT,
            film_poster TEXT,
            watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, film_id)
        )
    """)
    print("Watched table created.")

def createFollowersTable(cursor):
    cursor.execute("DROP TABLE IF EXISTS followers")
    cursor.execute("""
        CREATE TABLE followers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            followed_id INTEGER NOT NULL,
            followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, followed_id)
        )
    """)
    print("Followers table created.")

def createTables():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    createUsersTable(cursor)
    createReviewsTable(cursor)
    createLikesTables(cursor)
    createWatchlistTable(cursor)
    createWatchedTable(cursor)
    createFollowersTable(cursor)

    conn.commit()
    conn.close()
    print("✅ All tables created successfully.")

