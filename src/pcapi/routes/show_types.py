from flask import jsonify
from flask_login import login_required

from pcapi.flask_app import private_api
from pcapi.domain.show_types import show_types


@private_api.route('/showTypes', methods=['GET'])
@login_required
def list_show_types():
    return jsonify(show_types), 200
