from flask import jsonify, request
from . import landing_bp
from .recent import get_recent_films
from .reviews import get_reviews

@landing_bp.route("/all", methods=["GET"])
async def all():
    try:
        recent_films = get_recent_films()
        if not recent_films:
            return jsonify(
            {
                "trending_film": None,
                "recent_films": None, 
                "recent_reviews": None
            }), 404
        
        trending_film = None
        vote_count = 0
        for film in recent_films:
            if film.get("vote_count") > vote_count:
                trending_film = film
                vote_count = film.get("vote_count")

        recent_reviews = get_reviews(trending_film.get("id") if trending_film else None)

        recent_films = [film for film in recent_films if film.get("id") != trending_film.get("id")] if trending_film else recent_films

        top_6_recent_films = recent_films[:6] if len(recent_films) > 6 else recent_films

        rest_of_recent_films = recent_films[6:] if len(recent_films) > 6 else []

        return jsonify(
            {
            "trending_film": trending_film,
            "top_6_recent_films": top_6_recent_films,
            "recent_films": rest_of_recent_films, 
            "recent_reviews": recent_reviews
            }), 200

    except Exception as e:
        print(f"TMDB API Error: {e}")
        return jsonify({"error": "Failed to fetch movies from TMDB", "details": str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500