from flask import jsonify
from flask_login import login_required

from pcapi.flask_app import private_api
from pcapi.domain.types import get_formatted_active_product_types


@private_api.route('/types', methods=['GET'])
@login_required
def list_types():
    return jsonify(get_formatted_active_product_types()), 200
