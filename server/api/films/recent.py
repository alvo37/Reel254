import tmdbsimple as tmdb
from . import films_bp

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
        })

    return recent_films

@films_bp.route("/recent", methods=["GET"])
def recent_films():
    """Fetch recent films from TMDB."""
    try:
        recent_films = get_recent_films()
        if not recent_films:
            return {"message": "No recent films found"}, 404
        return {"recent_films": recent_films}, 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "An internal server error occurred"}, 500