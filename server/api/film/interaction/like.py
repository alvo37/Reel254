from .. import film_bp
from flask import request, jsonify
import sqlite3
import os
from datetime import datetime


def like_film(user_id, film_id):
    """Adds a like to a review by a specific user."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../../db/reeltone.db')

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM film_likes WHERE user_id = ? AND film_id = ?", (user_id, film_id))
        existing = cursor.fetchone()

        if existing:
            # User already liked — remove the like
            cursor.execute("DELETE FROM film_likes WHERE user_id = ? AND film_id = ?", (user_id, film_id))
            conn.commit()
            return {"message": "Like removed."}
        else:
            # User hasn't liked yet — insert new like
            cursor.execute("""
                INSERT INTO film_likes (user_id, film_id)
                VALUES (?, ?)
            """, (user_id, film_id))
            conn.commit()
            return {"message": "Review liked."}


@film_bp.route('/film/like', methods=['POST'])
def like_film_route():
    """Endpoint to like a film."""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        film_id = data.get("film_id")

        if not all([user_id, film_id]):
            return jsonify({"error": "Missing user_id or film_id."}), 400

        message = like_film(user_id, film_id)
    
        return jsonify({"message": message}), 201

    except Exception as e:
        print(f"Error liking review: {e}")
        return jsonify({"error": "Failed to like film.", "details": str(e)}), 500
