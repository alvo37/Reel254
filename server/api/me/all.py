from . import me_bp
from .friends import get_friends_activity
from .films import get_recent_films
from .reviews import get_reviews
from flask import request, jsonify

@me_bp.route("/all", methods=["GET"])
def all():
    try:
        """Endpoint to fetch all user-related data."""
        user_id = request.args.get("user_id")
        if not user_id:
            return {"error": "User ID is required"}, 400

        friends_activity = get_friends_activity(user_id=user_id)
        recent_films = get_recent_films()
        reviews = get_reviews()

        if not friends_activity and not recent_films and not reviews:
            return {"message": "No data found"}, 404
        return jsonify({
            "friends_activity": friends_activity,
            "recent_films": recent_films,
            "reviews": reviews
        }), 200
    
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500