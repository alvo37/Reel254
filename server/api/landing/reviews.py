from flask import jsonify, request
from . import landing_bp
import tmdbsimple as tmdb
from pprint import pprint


def get_reviews(film_id=None):
    """Fetch reviews for films from TMDB API. Return as a dictionary."""
    try:
        if not film_id:
            return {"error": "Film ID is required to fetch reviews"}
        
        movies = tmdb.Movies(film_id)
        response = movies.reviews()  

        # Extract relevant fields
        reviews = []
        for review in response.get('results', []):
            reviews.append({
                "id": review.get("id"),
                "author": review.get("author"),
                "content": review.get("content"),
                "url": review.get("url")
            })

        return response

    except Exception as e:
        print(f"TMDB API Error: {e}")
        return {"error": "Failed to fetch trending film from TMDB", "details": str(e)}
    
@landing_bp.route("/films/reviews", methods=["GET"])
def reviews():
    """Endpoint to fetch reviews for films."""
    film_id = request.args.get("film_id")
    if not film_id:
        return jsonify({"error": "Film ID is required"}), 400
    
    try:
        reviews = get_reviews(film_id)
        return jsonify({"reviews": reviews}), 200
    except Exception as e:
        print(f"An error occurred while fetching reviews: {e}")
        return jsonify({"error": "Failed to fetch reviews", "details": str(e)}), 500