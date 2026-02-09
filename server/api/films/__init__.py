from flask import Blueprint

films_bp = Blueprint('films', __name__, url_prefix='/films')

from . import all
from . import popular
from . import recent
from . import reviewed