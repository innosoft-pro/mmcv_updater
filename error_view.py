from flask import Flask, Blueprint

# TODO: Proper integration
app = Flask(__name__)

error_notification = Blueprint("errors", url_prefix="/error_notification")


@error_notification.route('/', methods=['GET'])
def show_errors():
    pass


app.register_blueprint(error_notification)
