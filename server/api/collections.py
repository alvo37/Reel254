from flask import Blueprint, jsonify

collections_bp = Blueprint('collections', __name__, url_prefix='/collections')

# Mock endpoint: list user collections
@collections_bp.route('/<int:user_id>', methods=['GET'])
def list_collections(user_id):
    mock = [
        {"id": 1, "name": "My Favorites", "movie_ids": [101, 202]},
        {"id": 2, "name": "Watch Later", "movie_ids": []}
    ]
    return jsonify(mock)
