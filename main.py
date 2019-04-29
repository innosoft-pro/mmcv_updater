from inputs.FlashDriveInput import FlashDriveInput
from heartbeat import heartbeat
from flask_app import app

from error_view import *
from inputs.WebInput import *

if __name__ == '__main__':
    fd_input = FlashDriveInput()
    web_input = WebInput()
    heartbeat.start()
    app.run()
    heartbeat.cancel()
