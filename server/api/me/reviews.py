from . import me_bp
from flask import jsonify, request
import sqlite3
import os

def get_reviews():
    """Fetch reviews with highest like count from database."""

    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../db/reeltone.db')

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        query = """SELECT *
                   FROM reviews
                   ORDER BY like_count DESC LIMIT 30"""
        cursor.execute(query)
        rows = cursor.fetchall()
        if not rows:
            return []
        print(f"Rows fetched: {rows}")

        reviews = []
        for row in rows:
            review = {
                "id": row[0],
                "user_id": row[1],
                "film_id": row[2],
                "content": row[3],
                "like_count": row[4],
                "created_at": row[5],
                "username": row[6],
                "profile_picture": row[7]
            }
            reviews.append(review) 
        print(f"Reviews Fetched {reviews}") 
        return reviews

@me_bp.route("/reviews", methods=["GET"])
def reviews():
    try:
        reviews = get_reviews()
        if not reviews:
            return jsonify({"message": "No reviews found"}), 404
        return jsonify({"reviews": reviews}), 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500