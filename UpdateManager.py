import os
import re

import Config
from images.DockerImage import DockerImage

inputs = list()
current_image = None
current_image_type = Config.parser["common"]["current_image"]

current_version = {}

if current_image_type == "docker":
    current_image = DockerImage(Config.parser["docker"]["current_container"])

if current_image is not None:
    version = re.search(r"(\d+)\.(\d+)\.(\d+)", Config.parser["common"]["current_version"])
    current_version['major'] = version.group(1)
    current_version['minor'] = version.group(2)
    current_version['patch'] = version.group(3)


def input_updated(device_input):
    # TODO: Probably check that the caller is in our inputs list
    image = device_input.find_image()
    if image is not None:
        update(image)
    else:
        error_notification("No image found!")


def add_input(device_input):
    inputs.append(device_input)


def have_free_space(size):
    '''
    :param size: size to check, in bytes
    :return: True if there is free space, false otherwise
    '''
    # TODO: not sure if this is the right way, but it sounds about right
    # TODO: this program will probably run everything in privileged mode anyway (docker group is root, supposedly)
    stat = os.statvfs("/")
    if size <= (stat.f_bavail * stat.f_frsize):
        return True
    return False


def update(image):
    if not have_free_space(image.image_size):
        return error_notification("Not enough space to install the image")
    # Installation could unpack some files, the running might require additional space and such. Better check it
    image.install()
    if not have_free_space(image.image_size):
        return error_notification("Not enough space to run the image")
    current_image.stop()
    image.run()

    # TODO : Add proper error handling

    # Save the info for later
    version_string = f"{image.version['major']}.{image.version['minor']}.{image.version['patch']}"
    Config.write("common", "current_version", version_string)
    Config.write("common", "current_image", image.image_type)
    image.save_info()


def error_notification(error):
    # TODO: more detailed error notification, integrate with the system itself
    print(error)
    return False


def is_newer(image):
    if image is not None:

        # All parameters are smaller than the current
        if image.version['major'] < current_version['major']:
            if image.version['minor'] < current_version['minor']:
                if image.version['patch'] < current_version['patch']:
                    return False

        # One of the parameters is greater
        if image.version['major'] > current_version['major']:
            # Newer major
            return True
        else:
            # Same major
            if image.version['minor'] > current_version['minor']:
                # Newer minor
                return True
            else:
                # Same minor
                if image.version['patch'] > current_version['patch']:
                    # Newer patch
                    return True
                else:
                    # All parameters are the same
                    # Reuploading images without patching could have bad consequences?
                    return False
