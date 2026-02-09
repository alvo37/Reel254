from flask import jsonify, request
from . import landing_bp
import tmdbsimple as tmdb
import os

def get_recent_films():
    """Fetch recent films from TMDB API. Return as a list of dictionaries."""
    movies = tmdb.Movies()
    response = movies.now_playing()

    img_base_url = os.getenv("TMDB_IMAGE_BASE_URL") or "https://image.tmdb.org/t/p"

    # Extract relevant fields
    recent_films = []
    for movie in response['results']:
        recent_films.append({
            "id": movie.get("id"),
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "poster_path": movie.get("poster_path"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
            "vote_count": movie.get("vote_count"),
            "popularity": movie.get("popularity"),
            "backdrop_path": movie.get("backdrop_path"),
            "poster_url": f"{img_base_url}/w500{movie.get('poster_path')}" if movie.get("poster_path") else None,
            "backdrop_url": f"{img_base_url}/w1280{movie.get('backdrop_path')}" if movie.get("backdrop_path") else None
        })

    return recent_films

@landing_bp.route("/films/recent", methods=["GET"])
def recent_films():
    try:
        films = get_recent_films()
        return jsonify({"recent_films": films}), 200
    except Exception as e:
        print(f"An error occurred while fetching recent films: {e}")
        return jsonify({"error": "Failed to fetch recent films", "details": str(e)}), 500
