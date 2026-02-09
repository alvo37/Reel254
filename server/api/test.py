from . import api_bp

@api_bp.route('/test', methods=['GET'])
async def test_team():
    """Test endpoint to verify server is running."""
    return {"message": "Server is running successfully!"}