from . import films_bp
from flask import jsonify
from .popular import get_popular_films
from .recent import get_recent_films
from .reviewed import get_reviewed_films


@films_bp.route("/all", methods=["GET"])
def all_films():
    """Fetch all films from TMDB."""
    try:
        popular_films = get_popular_films()
        recent_films = get_recent_films()
        reviewed_films = get_reviewed_films()
        if not popular_films and not recent_films and not reviewed_films:
            return jsonify({"message": "No films found"}), 404
        return jsonify({
            "popular_films": popular_films,
            "recent_films": recent_films,
            "reviewed_films": reviewed_films
        }), 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
