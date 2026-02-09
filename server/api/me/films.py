from . import me_bp
from flask import jsonify
import tmdbsimple as tmdb

def get_recent_films():
    """Fetch recent films from TMDB API. Return as a list of dictionaries."""
    movies = tmdb.Movies()
    response = movies.now_playing()

    # Extract relevant fields
    recent_films = []
    for movie in response['results']:
        recent_films.append({
            "id": movie.get("id"),
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "poster_path": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}" if movie.get("poster_path") else None,
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
            "vote_count": movie.get("vote_count"),
            "popularity": movie.get("popularity"),
        })

    return recent_films

    
@me_bp.route("/films", methods=["GET"])
def films():
    try:
        recent_films = get_recent_films()
        if not recent_films:
            return jsonify({"message": "No recent films found"}), 404
        return jsonify({"recent_films": recent_films}), 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500