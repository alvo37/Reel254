from .. import film_bp
from flask import jsonify, request
import tmdbsimple as tmdb

def get_related_films(film_id):
    """Fetch related films from TMDB API by film ID."""
    movie = tmdb.Movies(film_id)
    response = movie.recommendations()
    if 'status_code' in response and response['status_code'] != 200:
        return None

    related_films = []
    for film in response.get('results', []):
        related_films.append({
            "id": film.get("id"),
            "title": film.get("title"),
            "overview": film.get("overview"),
            "poster_path": f"https://image.tmdb.org/t/p/w500{film.get('poster_path')}" if film.get("poster_path") else None,
            "release_date": film.get("release_date"),
            "vote_average": film.get("vote_average"),
            "vote_count": film.get("vote_count"),
        })
    return related_films

@film_bp.route('/related', methods=['GET'])
def related():
    """Fetch related films by film ID from TMDB API."""
    try:
        film_id = request.args.get('film_id')
        if not film_id:
            return jsonify({'error': 'film_id is required'}), 400
        related_films = get_related_films(film_id)
        if not related_films:
            return jsonify({'message': 'No related films found for this film'}), 404
        return jsonify({'related_films': related_films}), 200
    except ValueError:
        return jsonify({'error': 'Invalid film_id format'}), 400
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred'}), 500