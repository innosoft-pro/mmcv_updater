import pyudev
from images.DockerImage import DockerImage
# TODO : subprocess should REALLY be sandboxed or changed to something different
from subprocess import Popen, PIPE
import re


class FlashDriveInput:
    '''

    Monitors Linux udev for usb insertion/deletion

    '''

    # TODO: move system-dependent code outside, to make sure we can use the code anywhere

    def __init__(self, update_manager):
        self.update_manager = update_manager

        # Load the pyudev context, monitor and observer.
        self.context = pyudev.Context()
        self.monitor = pyudev.Monitor.from_netlink(self.context)
        # TODO : Not sure this is always correct. This checks for new PARTITIONS, not just USBs
        # I am checking for USB later, though
        self.monitor.filter_by(subsystem='block', device_type='partition')

        # MonitorObserver is asynchronous, self.poll used as a callback function
        # TODO : poll() is supposed to be a private function. Still, should it be reused like this?
        self.observer = pyudev.MonitorObserver(self.monitor, self.poll)
        self.observer.start()

        self.device_path = ""

    def find_image(self):
        # TODO: add actual image detection
        ret = DockerImage(self.device_path, "hello_world.img")
        return ret

    def start_polling(self):
        # NOTE: Not supposed to do anything. Monitoring is not polled, but kinda event-driven
        pass

    def notify(self):
        self.update_manager.input_updated(self)

    def poll(self, action, device):
        # A new partition was added...
        if device["ID_BUS"] == "usb":
            # .. so make sure it's a USB partition, then mount/unmount it and notify the updateManager
            if action == 'add':
                # TODO : Not sure if this way is good. Seems sensible?
                mount = Popen(["udisksctl", "mount", "-b", device.device_node], stdout=PIPE, stderr=PIPE,
                              universal_newlines=True)
                (result, error) = mount.communicate()
                if len(error) == 0:
                    # TODO: We might have a problem with punctuation or unicode somewhere here
                    mpoint = re.search(r"\S*\/media\/\S*(?:\s|$)", result)
                    # [:-1] here to remove the dot added by the udisksctl
                    self.device_path = mpoint.group(0).strip()[:-1]
                    self.notify()
            elif action == 'remove':
                pass

