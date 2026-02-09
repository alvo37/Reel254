import tmdbsimple as tmdb
from . import films_bp
import sqlite3
import os

def get_reviewed_films():
    """FETCH top reviews from review table in reeltone DB"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../db/reeltone.db')
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            query = """SELECT * FROM reviews LIMIT 30"""
            cursor.execute(query)
            rows = cursor.fetchall()
            if not rows:
                return []
            reviewed_films = []
            for row in rows:
                film = {
                    "id": row[0],
                    "user_id": row[1],
                    "film_id": row[2],
                    "content": row[3],
                    "like_count": row[4],
                    "created_at": row[5],
                }
                reviewed_films.append(film)
            return reviewed_films
    except Exception as e:
        print(f"Database Error: {e}")
        return []
        

@films_bp.route("/reviewed", methods=["GET"])
def reviewed_films():
    """Fetch reviewed films from TMDB."""
    try:
        reviewed_films = get_reviewed_films()
        if not reviewed_films:
            return {"message": "No reviewed films found"}, 404
        return {"reviewed_films": reviewed_films}, 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "An internal server error occurred"}, 500
    