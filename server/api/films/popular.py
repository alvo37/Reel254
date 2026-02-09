import tmdbsimple as tmdb
from . import films_bp

def get_popular_films():
    """Fetch popular films from TMDB API. Return as a list of dictionaries."""
    movies = tmdb.Movies()
    response = movies.popular()

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


@films_bp.route("/popular", methods=["GET"])
def popular_films():
    """Fetch popular films from TMDB."""
    try:
        popular_films = get_popular_films()
        if not popular_films:
            return {"message": "No popular films found"}, 404
        return {"popular_films": popular_films}, 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "An internal server error occurred"}, 500