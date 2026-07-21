from flask import Blueprint, jsonify

communities_bp = Blueprint('communities', __name__, url_prefix='/communities')

# Mock endpoint: list communities
@communities_bp.route('/', methods=['GET'])
def list_communities():
    mock = [
        {"id": 1, "title": "Kenyan Classics", "description": "Discuss classic Kenyan movies", "spoiler_safe": true},
        {"id": 2, "title": "African Docs", "description": "Documentary lovers community", "spoiler_safe": false}
    ]
    return jsonify(mock)
