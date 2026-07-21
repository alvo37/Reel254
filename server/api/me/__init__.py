from flask import Blueprint

me_bp = Blueprint('me', __name__, url_prefix='/me')

from . import all, profile

# Register the profile blueprint under the /me namespace
me_bp.register_blueprint(profile.profile_bp, url_prefix='/profile')
from . import friends
from . import reviews
from . import films 



