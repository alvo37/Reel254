from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

from .create_user import *
from .authenticate_user import *
