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
        """
        Initialize the input
        """
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
        """
        Try to find an image on the USB drive
        :return: The image if any found, None if nothing is found
        """
        usb_files = os.listdir(self.device_path)
        image = None

        for file in usb_files:
            image = DockerImage.get_image(self.device_path, file)
            if image is not None:
                if UpdateManager.is_newer(image):
                    break

        return image

    def start_polling(self):
        # NOTE: Not supposed to do anything. Monitoring is not polled, but is event-driven
        # TODO: pyudev might run off desktop environment event or something like that? Check that for headless machines
        pass

    def notify(self):
        """
        Notify the update manager that a USB drive was inserted
        """
        UpdateManager.input_updated(self)

    def poll(self, action, device):
        """
        Responds to a USB drive being inserted
        :param action: action data from pyudev
        :param device: device on which the action took place
        """
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
