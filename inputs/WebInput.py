import os
import shutil

from flask_app import app
from flask.views import MethodView
from flask import render_template, request
from werkzeug.utils import secure_filename

import UpdateManager
from images.DockerImage import DockerImage


class WebInput(MethodView):
    def __init__(self):
        self.image_file = None
        self.image_path = app.config['UPLOAD_FOLDER']

    def find_image(self):
        # TODO: proper image type detection
        # The idea is that there can be multiple image types. The image detection here for docker here is fine

        image = None
        file_path = os.path.join(self.image_path, self.image_file)
        if os.path.exists(file_path):
            image = DockerImage.get_image(self.image_path, self.image_file)

            # Found a newer image
            if image is not None and not UpdateManager.is_newer(image):
                image = None

            # Delete the file after the search - no reason to save it
            os.remove(file_path)

        return image

    def start_polling(self):
        pass

    def notify(self):
        UpdateManager.input_updated(self)

    def poll(self):
        total, used, free = shutil.disk_usage("/")
        current_image_size = UpdateManager.current_image.image_size
        return render_template("web_input.html", free_memory=free, total_memory=total,
                               current_image_size=current_image_size)

    def post(self):
        if 'image' not in request.files:
            return "No file sent!"

        file = request.files['image']

        self.image_file = secure_filename(file.filename)

        os.makedirs(self.image_path, exist_ok=True)
        file.save(os.path.join(self.image_path, self.image_file))

        self.notify()

        return "Update image sent!"

    def get(self):
        return self.poll()


# NOTE: Tried to use a blueprint here, doesn't work for some reason
app.add_url_rule("/update/", view_func=WebInput.as_view("web_input"))
app.add_url_rule("/update/send_image/", view_func=WebInput.as_view("send_image"))
