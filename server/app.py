from flask_cors import CORS
from flask import Flask
from api import api_bp
import os
import tmdbsimple as tmdb

app = Flask(__name__)

# Load TMDB API key from environment variable or use a default value
TMDB_API_KEY = os.environ.get("TMDB_API_KEY", "YOUR_TMDB_API_KEY_HERE")
tmdb.API_KEY = TMDB_API_KEY

# Enable CORS for all domains
CORS(app, resources={r"/*": {"origins": "*"}})
app.register_blueprint(api_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8888)
