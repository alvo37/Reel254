from .. import film_bp
from flask import request, jsonify
import sqlite3
import os

def add_to_watched(user_id, film_id, film_title, film_poster):
    """Adds a film to the user's watched list."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../../db/reeltone.db')

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM watched WHERE user_id = ? AND film_id = ?", (user_id, film_id))
        existing = cursor.fetchone()

        if existing:
            # Film already in watched list
            cursor.execute("""DELETE FROM watched_films WHERE user_id = ? AND film_id = ?""", (user_id, film_id))
            conn.commit()
            return {"message": "Film removed from watched list."}
        else:
            # Film not in watched list, insert it
            cursor.execute("""
                INSERT INTO watched_films (user_id, film_id, film_title, film_poster)
                VALUES (?, ?, ?, ?)
            """, (user_id, film_id, film_title, film_poster))
            conn.commit()
            return {"message": "Film added to watched list."}

@film_bp.route('/film/watched', methods=['POST'])
def add_watched_route():
    """Endpoint to add a film to the watched list."""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        film_id = data.get("film_id")
        film_title = data.get("film_title")
        film_poster = data.get("film_poster")

        if not all([user_id, film_id, film_title, film_poster]):
            return jsonify({"error": "Missing user_id, film_id, film_title, or film_poster."}), 400
        
        message = add_to_watched(user_id, film_id, film_title, film_poster)
        return jsonify({"message": message}), 201
    except Exception as e:
        print(f"Error adding film to watched list: {e}")
        return jsonify({"error": "Failed to add film to watched list.", "details": str(e)}), 500
