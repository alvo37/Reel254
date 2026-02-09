# Import the Blueprint for routing and required modules
from .. import film_bp
import tmdbsimple as tmdb  # TMDB API wrapper
from flask import jsonify, request  # Flask utilities for API responses and request data

# ===== Helper Functions =====

def get_by_id(film_id):
    """
    Fetch film details from TMDB using the film's numeric ID.
    
    Args:
        film_id (int): TMDB movie ID

    Returns:
        dict: Movie details from TMDB or None if not found/error
    """
    movie = tmdb.Movies(film_id)  # Initialize TMDB movie object
    response = movie.info()        # Fetch movie details
    # Check if TMDB response contains an error status code
    if 'status_code' in response and response['status_code'] != 200:
        return None
    return response


def get_by_title(title):
    """
    Fetch film details from TMDB using the film's title.
    
    Args:
        title (str): Movie title to search for

    Returns:
        dict: First search result from TMDB or None if not found/error
    """
    search = tmdb.Search()  # Initialize TMDB search object
    response = search.movie(query=title)  # Perform movie search
    # Check for errors in the response
    if 'status_code' in response and response['status_code'] != 200:
        return None
    # If no results are returned, return None
    if response['total_results'] == 0:
        return None
    # Return the first matching movie
    return response['results'][0] 


def get_essential_data(query):
    """
    Fetch only the essential data for a film from TMDB.
    
    Args:
        query (str): Movie ID (numeric) or movie title (string)

    Returns:
        dict: Dictionary containing essential movie information or None
    """
    response = None
    if query.isdigit():
        # If query is numeric, treat it as a TMDB movie ID
        film_id = int(query)
        response = get_by_id(film_id)
    else:
        # Otherwise, treat it as a movie title
        response = get_by_title(query)

    # If no valid response, return None
    if response is None:
        return None

    # Extract essential fields from TMDB response
    essential_data = {
        'id': response.get('id'),
        'title': response.get('title'),
        'original_title': response.get('original_title'),
        'overview': response.get('overview'),
        'release_date': response.get('release_date'),
        'runtime': response.get('runtime'),
        'genres': [genre['name'] for genre in response.get('genres', [])],
        'vote_average': response.get('vote_average'),
        'vote_count': response.get('vote_count'),
        # Construct full image URLs if paths exist
        'poster_path': f"https://image.tmdb.org/t/p/w500{response.get('poster_path')}" 
                       if response.get("poster_path") else None,
        'backdrop_path': f"https://image.tmdb.org/t/p/w1280{response.get('backdrop_path')}" 
                         if response.get("backdrop_path") else None,
    }
    return essential_data


# ===== Flask Route =====
@film_bp.route('/essential', methods=['GET'])
def essential():
    """
    API endpoint to fetch essential film data by query (ID or title).
    
    Query Params:
        query (str): Movie ID (numeric) or movie title (string)
    
    Responses:
        200: Returns essential movie data as JSON
        400: Query missing or invalid
        404: Film not found
    """
    try:
        query = request.args.get('query')  # Extract 'query' parameter from GET request
        if not query:
            # Return 400 if query parameter is missing
            return jsonify({'error': 'query is required'}), 400
        
        # Fetch essential movie data using helper function
        essential_data = get_essential_data(query)
        if essential_data is None:
            # Return 404 if no movie is found
            return jsonify({'error': 'Film not found'}), 404
        
        # Return the data with status 200
        return jsonify(essential_data), 200
    except ValueError:
        # Handle invalid query format (e.g., non-numeric ID when expected)
        return jsonify({'error': 'Invalid query format'}), 400
