from flask import Blueprint, jsonify

feed_bp = Blueprint('feed', __name__, url_prefix='/feed')

# Mock activity feed data
@feed_bp.route('/<int:user_id>', methods=['GET'])
def get_feed(user_id):
    mock_feed = [
        {"type": "watch", "movie_id": 101, "title": "The Great Safari", "timestamp": "2023-01-01T12:00:00Z"},
        {"type": "achievement", "name": "First Watch", "timestamp": "2023-01-02T15:30:00Z"}
    ]
    return jsonify(mock_feed)
