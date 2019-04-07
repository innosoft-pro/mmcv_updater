from flask import Flask, Blueprint

import UpdateManager

# TODO: Proper integration
app = Flask(__name__)

error_notification = Blueprint("errors", __name__, url_prefix="/error_notification")


@error_notification.route('/', methods=['GET'])
def show_errors():
    return UpdateManager.current_image.get_errors()


app.register_blueprint(error_notification)
