import os

import Config

import pyudev
from images.DockerImage import DockerImage
# TODO : subprocess should REALLY be sandboxed or changed to something different
from subprocess import Popen, PIPE
import re

import UpdateManager


class FlashDriveInput:
    """

    Monitors Linux udev for usb insertion/deletion

    """

    # TODO: move system-dependent code outside, to make sure we can use the code anywhere

    def __init__(self):
        # Load the pyudev context, monitor and observer.
        self.context = pyudev.Context()
        self.monitor = pyudev.Monitor.from_netlink(self.context)
        # NOTE: This part check for added partitions, we check that the partition came from usb subsystem
        # In case anything breaks, this might be the cause
        self.monitor.filter_by(subsystem='block', device_type='partition')

        # MonitorObserver is asynchronous, self.poll used as a callback function
        # TODO : poll() is supposed to be a private function. Still, should it be reused like this?
        self.observer = pyudev.MonitorObserver(self.monitor, self.poll)
        self.observer.start()

        self.device_path = ""

    def find_image(self):
        usb_files = os.listdir(self.device_path)
        image = None

        version = re.search(r"(\d+)\.(\d+)\.(\d+)", Config.parser["common"]["current_version"])
        cur_major = version.group(1)
        cur_minor = version.group(2)
        cur_patch = version.group(3)

        for file in usb_files:
            image = DockerImage.get_image(self.device_path, file)
            if image is not None:
                # Seems to be the most reliably way?
                if image.version['major'] <= cur_major:
                    if image.version['minor'] <= cur_minor:
                        if image.version['patch'] <= cur_patch:
                            continue
                break

        return image

    def start_polling(self):
        # NOTE: Not supposed to do anything. Monitoring is not polled, but is event-driven
        # TODO: pyudev might run off desktop environment event or something like that? Check that for headless machines
        pass

    def notify(self):
        UpdateManager.input_updated(self)

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
                    # [:-1] here to removxe the dot added by the udisksctl
                    self.device_path = mpoint.group(0).strip()[:-1]
                    self.notify()
            elif action == 'remove':
                pass
