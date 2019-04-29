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
        """
        Initialize the input
        """
        self.image_file = None
        self.image_path = app.config['UPLOAD_FOLDER']

    def find_image(self):
        """
        Try to find an image on the USB drive
        :return: The image if any found, None if nothing is found
        """
        # TODO: proper image type detection
        # The idea is that there can be multiple image types. The image detection here for docker here is fine

        image = None
        file_path = os.path.join(self.image_path, self.image_file)
        if os.path.exists(file_path):
            image = DockerImage.get_image(self.image_path, self.image_file)

            # Found a newer image
            if image is not None:
                if UpdateManager.is_newer(image):
                    # Problem: we can't directly delete the file that we got since it's needed for installation
                    # Solution: install the image ourselves before removing the file
                    # Kinda hacky fix - I still want to save up space though
                    if not UpdateManager.have_free_space(image.image_size):
                        return UpdateManager.error_notification("Not enough space to install the image")
                    image.install()
                else:
                    image = None

            # Delete the file after the search - no reason to save it
            os.remove(file_path)

        return image

    def start_polling(self):
        pass

    def notify(self):
        """
        Notify the update manager that an image was received
        """
        UpdateManager.input_updated(self)

    def poll(self):
        """
        Return the web interface page
        :return: template rendering data from flask
        """
        total, used, free = shutil.disk_usage("/")
        current_image_size = UpdateManager.current_image.image_size
        return render_template("web_input.html", free_memory=free, total_memory=total,
                               current_image_size=current_image_size)

    def post(self):
        """
        Receive the image file and save it in temporary folder
        :return: web-page for successful image sending
        """
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
