from threading import Timer
# Can be done with something lighter, but
import requests

heartbeat_unreachable = False


class RepeatingTimer(Timer):
    def run(self):
        while not self.finished.is_set():
            self.function(*self.args, **self.kwargs)
            self.finished.wait(self.interval)


def heartbeat_func(address):
    try:
        r = requests.get(address)
    except requests.exceptions.RequestException:
        global heartbeat_unreachable
        heartbeat_unreachable = True
    print(heartbeat_unreachable)


heartbeat = RepeatingTimer(5, heartbeat_func, ["http://0.0.0.0:4999/configurator/status"])
