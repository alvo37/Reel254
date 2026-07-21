from flask import Blueprint

from .auth import auth_bp
from .landing import landing_bp
from .me import me_bp
from .films import films_bp
from .film import film_bp
from .members import members_bp

api_bp = Blueprint('api', __name__)

api_bp.register_blueprint(auth_bp, url_prefix='/auth')
api_bp.register_blueprint(landing_bp, url_prefix='/landing')
api_bp.register_blueprint(me_bp, url_prefix='/me')
api_bp.register_blueprint(films_bp, url_prefix='/films')
api_bp.register_blueprint(film_bp, url_prefix='/film')
from .feed import feed_bp
from .collections import collections_bp
from .achievements import achievements_bp
from .communities import communities_bp
# from .discover import discover_bp  # discover module not present

api_bp.register_blueprint(feed_bp, url_prefix='/feed')
api_bp.register_blueprint(collections_bp, url_prefix='/collections')
api_bp.register_blueprint(achievements_bp, url_prefix='/achievements')
api_bp.register_blueprint(communities_bp, url_prefix='/communities')
# api_bp.register_blueprint(discover_bp, url_prefix='/discover')  # discover module not present
from . import test
