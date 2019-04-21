import shutil

from flask_app import app
from flask.views import MethodView
from flask import render_template, request

import humanize

import UpdateManager


class WebInput(MethodView):
    def __init__(self):
        pass

    def find_image(self):
        pass

    def start_polling(self):
        pass

    def notify(self):
        pass

    def poll(self):
        total, used, free = shutil.disk_usage("/")
        current_image_size = UpdateManager.current_image.image_size
        return render_template("web_input.html", free_memory=free, total_memory=total,
                               current_image_size=current_image_size)

    def post(self):
        return "Update image sent!"

    def get(self):
        return self.poll()


# NOTE: Tried to use a blueprint here, doesn't work for some reason
app.add_url_rule("/update/", view_func=WebInput.as_view("web_input"))
app.add_url_rule("/update/send_image/", view_func=WebInput.as_view("send_image"))
