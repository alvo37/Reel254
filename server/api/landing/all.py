from flask import jsonify
from . import landing_bp
from .recent import get_recent_films
from .reviews import get_reviews


@landing_bp.route("/all", methods=["GET"])
def all():
    try:
        recent_films = get_recent_films()
    except Exception as e:
        print(f"TMDB API Error while fetching landing data: {e}")
        recent_films = []

    if not recent_films:
        return jsonify(
            {
                "trending_film": None,
                "top_6_recent_films": [],
                "recent_films": [],
                "recent_reviews": [],
            }
        ), 200

    trending_film = None
    vote_count = -1
    for film in recent_films:
        film_vote_count = film.get("vote_count") or 0
        if film_vote_count > vote_count:
            trending_film = film
            vote_count = film_vote_count

    recent_reviews = []
    if trending_film and trending_film.get("id"):
        try:
            recent_reviews = get_reviews(trending_film.get("id"))
        except Exception as e:
            print(f"TMDB API Error while fetching reviews: {e}")
            recent_reviews = []

    filtered_films = [
        film for film in recent_films if film.get("id") != (trending_film.get("id") if trending_film else None)
    ]
    top_6_recent_films = filtered_films[:6] if len(filtered_films) > 6 else filtered_films
    rest_of_recent_films = filtered_films[6:] if len(filtered_films) > 6 else []

    return jsonify(
        {
            "trending_film": trending_film,
            "top_6_recent_films": top_6_recent_films,
            "recent_films": rest_of_recent_films,
            "recent_reviews": recent_reviews,
        }
    ), 200