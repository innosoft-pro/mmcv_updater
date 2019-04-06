import json
from datetime import datetime
from os.path import splitext, join
from random import randint
from time import sleep

from flask import request, Response, render_template, jsonify, make_response, Flask, redirect
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


app = Flask(__name__)

config = {}
status = False
connection_string = ''
video_path = ''
with open(join(app.static_folder, 'images', 'on.jpg'), 'rb') as f:
    frame_on = f.read()
with open(join(app.static_folder, 'images', 'off.jpg'), 'rb') as f:
    frame_off = f.read()


@app.route('/', methods=['GET'])
def index():
    return redirect('/configurator')


@app.route('/configurator/', methods=['GET'])
def main_page():
    return render_template('index.html')


@app.route('/configurator/runPipeline', methods=['POST'])
def run_pipeline():
    global status
    status = True
    return jsonify(result=True, message='')


@app.route('/configurator/stopPipeline', methods=['POST'])
def stop_pipeline():
    global status
    status = False
    return jsonify(result=True, message='')


@app.route('/configurator/defaultNTP', methods=['GET'])
def get_default_ntp():
    return jsonify({'NTP': 'pool.ntp.org'})


@app.route('/configurator/defaultTZ', methods=['GET'])
def get_default_tz():
    return jsonify({'TZ': 'kek'})


@app.route('/configurator/timezonesList', methods=['GET'])
def timezones_list():
    return json.dumps([('kek', 'super')])


@app.route('/configurator/currentDateTime', methods=['GET'])
def current_date_time():
    now = datetime.now()
    return jsonify({'date': now.strftime("%d.%m.%Y"), 'time': now.strftime("%H:%M:%S")})


@app.route('/configurator/syncDateTime', methods=['POST'])
def sync_date_time():
    return jsonify(result=True, message='')


@app.route('/configurator/setConnectionString', methods=['POST'])
def set_connection_string():
    global connection_string
    connection_string = request.get_json()['connection_string']
    return jsonify(result=True, message='')


@app.route('/configurator/getConnectionString', methods=['GET'])
def get_connection_string():
    return jsonify(connection_string=connection_string)


@app.route('/configurator/status', methods=['GET'])
def get_sbc_status():
    return jsonify(
        camera=bool(connection_string),
        base_config='base_config' in config,
        markup_config='markup_config' in config,
        pipeline_status='working' if status else 'stopped',
        uptime=0,
        counted=0,
        timesync=True,
        cpu='9000%',
        ram='10/10 MB',
        system_type='core',
        system_version='mock'
    )


@app.route('/configurator/videoFeed', methods=['GET'])
@app.route('/configurator/runOnVideoFeed', methods=['GET'])
@app.route('/configurator/videoBGSFeed', methods=['GET'])
@app.route('/configurator/runOnVideoFeedBGS', methods=['GET'])
@app.route('/configurator/tf', methods=['GET'])
def video_feed():
    return Response(streamer(), mimetype='multipart/x-mixed-replace; boundary=frame')


def streamer():
    while True:
        frame = frame_on if status else frame_off
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n%s\r\n' % frame)
        sleep(1)


@app.route('/configurator/videoDirectory', methods=['GET'])
def all_available_videos():
    return jsonify({'bepis.avi': {'has_config': True, 'first_frame': ''}})


@app.route('/configurator/runOnVideo', methods=['GET'])
def run_on_video():
    global status, video_path
    video_path = request.args.get('selected_video')
    status = True
    return jsonify(result=True, message='')


@app.route('/configurator/currentVideoState', methods=['GET'])
def current_video_state():
    return jsonify({'isRunning': status, 'selectedKey': video_path})


@app.route('/configurator/stopVideo', methods=['GET'])
def stop_video():
    global status
    status = False
    return jsonify(result=True, message='')


@app.route('/configurator/saveVideoConfig', methods=['POST'])
def save_video_config():
    return jsonify(result=True, message='')


@app.route('/configurator/pipeline_load', methods=['GET'])
def get_pipeline_config():
    return jsonify([
        {'name': 'stop', 'load': randint(0, 100)},
        {'name': 'T', 'load': randint(0, 100)},
        {'name': 'series', 'load': randint(0, 100)},
    ])


@app.route('/configurator/reboot', methods=['GET'])
def reboot():
    return jsonify(result=True, message='')


@app.route('/configurator/shutdown', methods=['GET'])
def shutdown():
    return jsonify(result=True, message='')


@app.route('/configurator/config')
def get_config():
    return jsonify(config)


@app.route('/configurator/config/download')
def config_download():
    response = make_response(jsonify(config))
    cd = 'attachment; filename=config.json'
    response.headers['Content-Disposition'] = cd
    response.mimetype = 'application/json'
    return response


@app.route('/configurator/config/upload', methods=['POST'])
def upload_file():
    global config
    file = request.files.get('file')
    if file and splitext(file.filename)[-1] == '.json':
        config = json.loads(file.read().decode('utf-8'))
        return jsonify(result=True, message='')
    else:
        return jsonify(result=False, message='Расширение файла должно быть .json')


@app.route('/configurator/config/edit', methods=['POST'])
def config_edit():
    global config
    config = request.get_json()
    return jsonify(success=True, message='')


if __name__ == '__main__':
    options = {
        "bind": "0.0.0.0:5000",
        "workers": 1,
        "name": "mmcv",
        "errorlog": "gunicorn.log",
        "accesslog": "gunicorn.log",
        "threads": 10,
        "timeout": 120,
        "reload": True
    }
    StandaloneApplication(app, options).run()
