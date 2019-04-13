from flask_app import app
from flask.views import View


class WebInput(View):
    def __init__(self):
        pass

    def find_image(self):
        pass

    def start_polling(self):
        pass

    def notify(self):
        pass

    def poll(self):
        return "Hello!"

    def dispatch_request(self):
        return self.poll()


# NOTE: Tried to use a blueprint here, doesn't work for some reason
app.add_url_rule("/update/", view_func=WebInput.as_view("web_input"))
