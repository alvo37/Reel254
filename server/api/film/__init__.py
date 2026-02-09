from flask import Blueprint

film_bp = Blueprint('film', __name__, url_prefix='/film')

from . import all
from .extra import *
from .interaction import *
from .reviews import *
