from .. import film_bp
from flask import request, jsonify
import sqlite3
import os
from datetime import datetime


def like_review(user_id, review_id):
    """Adds a like to a review by a specific user."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../../db/reeltone.db')

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM review_likes WHERE user_id = ? AND review_id = ?", (user_id, review_id))
        existing = cursor.fetchone()

        if existing:
            # User already liked — remove the like
            cursor.execute("DELETE FROM review_likes WHERE user_id = ? AND review_id = ?", (user_id, review_id))
            conn.commit()
            return {"message": "Like removed."}
        else:
            # User hasn't liked yet — insert new like
            cursor.execute("""
                INSERT INTO review_likes (user_id, review_id, created_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            """, (user_id, review_id))
            conn.commit()
            return {"message": "Review liked."}


@film_bp.route('/reviews/like', methods=['POST'])
def like_review_route():
    """Endpoint to like a review."""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        review_id = data.get("review_id")

        if not all([user_id, review_id]):
            return jsonify({"error": "Missing user_id or review_id."}), 400

        message = like_review(user_id, review_id)
    
        return jsonify({"message": message}), 201

    except Exception as e:
        print(f"Error liking review: {e}")
        return jsonify({"error": "Failed to like review.", "details": str(e)}), 500
