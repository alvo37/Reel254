from . import film_bp
from flask import jsonify, request
from .essential.essential import get_essential_data  # Function to fetch essential film data from TMDB
from .reviews.get import get_reviews_by_film_id      # Function to fetch reviews for a film
from .extra.related import get_related_films         # Function to fetch related films
import sqlite3
import os

def record_exists(table, user_id, film_id):
    """
    Generic helper function to check if a record exists in a given table.
    Checks if a user has liked, watched, or added a film to their watchlist.

    Args:
        table (str): Table name to query ('film_likes', 'watchlist', 'watched').
        user_id (str): The ID of the user.
        film_id (int): The ID of the film.

    Returns:
        bool: True if the record exists, False otherwise.
    """
    # Build absolute path to the SQLite database
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '../../db/reeltone.db')

    # Connect to SQLite database and check for existence
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT 1 FROM {table} WHERE user_id = ? AND film_id = ? LIMIT 1", 
            (user_id, film_id)
        )
        return cursor.fetchone() is not None

@film_bp.route('/all', methods=['GET'])
def all_films():
    """
    API endpoint to fetch all relevant film data for a given query.

    Query Parameters:
        query (str): Film ID or title (required)
        user_id (str, optional): User ID to check personal flags (liked, watchlist, watched)

    Returns:
        JSON response with:
            - essential_data: Core film information from TMDB
            - reviews: List of reviews for the film
            - related_films: List of related/recommended films
            - user_flags: User-specific flags (liked, in watchlist, watched)
    """
    try:
        # Get query parameters
        query = request.args.get('query')
        user_id = request.args.get('user_id')
        
        # Validate query parameter
        if not query:
            return jsonify({'error': 'query parameter is required'}), 400
    
        if user_id and not query:
            return jsonify({'error': 'query is required when user_id is provided'}), 400

        # Fetch essential film data (title, overview, poster, etc.)
        essential_data = get_essential_data(query)

        if essential_data is None:
            return jsonify({'error': 'Film not found'}), 404
        
        # Extract film ID from the essential data
        film_id = essential_data.get('id')
        if not film_id:
            return jsonify({'error': 'Film ID not found in the response'}), 404
        
        # Fetch additional data
        reviews = get_reviews_by_film_id(film_id)     # Reviews for this film
        related_films = get_related_films(film_id)    # Related/recommended films
        has_liked_film = record_exists("film_likes", user_id, film_id)        # Check if user liked this film
        has_film_in_watchlist = record_exists("watchlist", user_id, film_id)  # Check if film is in user's watchlist
        has_watched_film = record_exists("watched", user_id, film_id)         # Check if user has marked as watched

        # Return combined response
        return jsonify({
            'essential_data': essential_data,
            'reviews': reviews,
            'related_films': related_films,
            'user_flags': {
                'has_liked': has_liked_film,
                'in_watchlist': has_film_in_watchlist,
                'watched': has_watched_film
            }
        }), 200
    except ValueError:
        # Handle invalid input format (e.g., non-numeric ID)
        return jsonify({'error': 'Invalid query format'}), 400
