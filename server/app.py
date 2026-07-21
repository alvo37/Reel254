from flask_cors import CORS
from flask import Flask
from api import api_bp
import os
from pathlib import Path
import tmdbsimple as tmdb

app = Flask(__name__)


def get_tmdb_api_key():
    key = os.environ.get("TMDB_API_KEY") or os.environ.get("NEXT_PUBLIC_TMDB_API_KEY")
    if key and key != "YOUR_TMDB_API_KEY_HERE":
        return key

    client_env_path = Path(__file__).resolve().parent.parent / "client" / ".env"
    if client_env_path.exists():
        for line in client_env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("NEXT_PUBLIC_TMDB_API_KEY="):
                value = line.split("=", 1)[1].strip().strip('"').strip("'")
                if value:
                    return value

    return "f529251dd967b9c34355a0e5e4d8c99f"


TMDB_API_KEY = get_tmdb_api_key()
os.environ["TMDB_API_KEY"] = TMDB_API_KEY
tmdb.API_KEY = TMDB_API_KEY

# Enable CORS for all domains
CORS(app, resources={r"/*": {"origins": "*"}})
app.register_blueprint(api_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8888)
