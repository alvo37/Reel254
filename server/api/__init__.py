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
api_bp.register_blueprint(members_bp, url_prefix='/members')
from . import test
