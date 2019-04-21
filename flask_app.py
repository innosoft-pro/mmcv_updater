from flask import Flask
from gunicorn.app.base import BaseApplication


class StandaloneApplication(BaseApplication):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        for key, value in self.options.items():
            if key.lower() in self.cfg.settings and value is not None:
                self.cfg.set(key.lower(), value)

    def load(self):
        return self.application


# TODO: Proper integration
app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = "temp_image"
