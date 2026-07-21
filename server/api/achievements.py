from flask import Blueprint, jsonify

achievements_bp = Blueprint('achievements', __name__, url_prefix='/achievements')

# Mock endpoint: list achievements for a user
@achievements_bp.route('/<int:user_id>', methods=['GET'])
def list_achievements(user_id):
    mock = [
        {"id": 1, "name": "First Watch", "description": "Watch your first movie", "earned": True},
        {"id": 2, "name": "Collector", "description": "Create a collection", "earned": False}
    ]
    return jsonify(mock)
