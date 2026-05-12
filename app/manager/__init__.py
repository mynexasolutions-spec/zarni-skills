from flask import Blueprint

manager_bp = Blueprint('manager', __name__)

from app.manager import routes  # noqa: F401, E402
