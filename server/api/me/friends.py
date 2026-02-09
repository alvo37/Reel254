from . import me_bp
from flask import jsonify, request
import sqlite3
import os

def get_friends_activity(user_id):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../db/reeltone.db')

    if not user_id:
        raise ValueError("User ID is required")
    
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        query = """SELECT reviews.*, followers.follower_id
                   FROM reviews
                    JOIN followers ON reviews.user_id = followers.follower_id
                   WHERE followers.followed_id = ?"""
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        if not rows:
            return []
        print(f"Rows fetched: {rows}")
        friends_activity = []
        for row in rows:
            activity = {
                "review_id": row[0],
                "user_id": row[1],
                "film_id": row[2],
                "content": row[3],
                "like_count": row[4],
                "created_at": row[5],
                "follower_id": row[6]
            }
        friends_activity.append(activity)
        return friends_activity
    

@me_bp.route("/friends", methods=["GET"])
def friends():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        friends_activity = get_friends_activity(user_id)
        if not friends_activity:
            return jsonify({"message": "No friends activity found"}), 404
        return jsonify({"friends_activity": friends_activity}), 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500