from flask import Blueprint, request, jsonify

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

# Mock GET profile by user ID
@profile_bp.route('/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    mock_profile = {
        "id": user_id,
        "username": f"user{user_id}",
        "bio": "Movie enthusiast from Kenya",
        "avatar_url": "https://picsum.photos/200",
        "followers": 123,
        "following": 45,
        "collections": [],
        "achievements": []
    }
    return jsonify(mock_profile)

# Mock UPDATE profile (PUT)
@profile_bp.route('/', methods=['PUT'])
def update_profile():
    data = request.json or {}
    # In a real implementation, persist changes to DB
    return jsonify({"message": "Profile updated", "data": data})
