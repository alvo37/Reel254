from .. import film_bp
from flask import request, jsonify
import sqlite3
import os
from datetime import datetime


def add_review(
        user_id, 
        username, 
        pfp_url, 
        film_id, 
        film_title, 
        film_poster, 
        rating, 
        review_text, 
        is_parent=True, 
        parent_id=None
    ):
    """Inserts a review into the SQLite database."""

    # Get the absolute path to the database
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../../db/reeltone.db')

    # Insert the review into the database
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reviews (
                user_id, username, pfp_url,
                film_id, film_title, film_poster,
                rating, review_text,
                is_parent, parent_id, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, username, pfp_url,
            film_id, film_title, film_poster,
            rating, review_text,
            bool(is_parent), parent_id, datetime.utcnow()
        ))
        conn.commit()


@film_bp.route('/reviews/add', methods=['POST'])
def add_review_route():
    """Endpoint to add a new film review."""
    try:
        data = request.get_json()

        user_id = data.get("user_id")
        username = data.get("username")
        pfp_url = data.get("pfp_url")
        film_id = data.get("film_id")
        film_title = data.get("film_title")
        film_poster = data.get("film_poster")
        rating = data.get("rating")
        review_text = data.get("review_text")
        is_parent = data.get("is_parent", True)
        parent_id = data.get("parent_id")

        if not all([user_id, username, film_id, film_title]):
            return jsonify({"error": "Missing required fields."}), 400

        add_review(
            user_id=user_id,
            username=username,
            pfp_url=pfp_url,
            film_id=film_id,
            film_title=film_title,
            film_poster=film_poster,
            rating=rating,
            review_text=review_text,
            is_parent=is_parent,
            parent_id=parent_id
        )

        return jsonify({"message": "Review added successfully."}), 201

    except Exception as e:
        print(f"Error adding review: {e}")
        return jsonify({"error": "Failed to add review.", "details": str(e)}), 500