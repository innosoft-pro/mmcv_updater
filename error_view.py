from flask import Blueprint

from flask_app import app
import UpdateManager

error_notification = Blueprint("errors", __name__, url_prefix="/error_notification")


@error_notification.route('', methods=['GET'])
def show_errors():
    return UpdateManager.current_image.get_errors()


app.register_blueprint(error_notification)
