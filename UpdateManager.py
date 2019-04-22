import os
import re

import Config
import docker
from images.DockerImage import DockerImage

inputs = list()
current_image = None
current_image_type = None


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

    global current_image
    current_image.stop()
    image.run()
    current_image = image

    # TODO : Add proper error handling

    # Save the info for later
    save_state()


def error_notification(error):
    # TODO: more detailed error notification, integrate with the system itself
    print(error)
    return False


def is_newer(image):
    if image is not None:
        if current_image is None:
            # No image, so any image is newer
            return True

        # All parameters are smaller than the current
        if image.version['major'] < current_image.version['major']:
            if image.version['minor'] < current_image.version['minor']:
                if image.version['patch'] < current_image.version['patch']:
                    return False

        # One of the parameters is greater
        if image.version['major'] > current_image.version['major']:
            # Newer major
            return True
        else:
            # Same major
            if image.version['minor'] > current_image.version['minor']:
                # Newer minor
                return True
            else:
                # Same minor
                if image.version['patch'] > current_image.version['patch']:
                    # Newer patch
                    return True
                else:
                    # All parameters are the same
                    # Reuploading images without patching could have bad consequences?
                    return False


def save_state():
    if current_image:
        version_string = f"{current_image.version['major']}.{current_image.version['minor']}." \
            f"{current_image.version['patch']}"
        Config.write("common", "current_version", version_string)
        current_image.save_info()


if os.path.exists(Config.file_name):
    current_image_type = Config.parser["common"]["current_image"]

    if current_image_type == "docker":
        current_image = DockerImage(Config.parser["docker"]["current_container"])

else:
    # TODO: Proper image detection, not just for Docker
    docker = docker.from_env()
    containers = docker.containers.list()
    current_version = {'major': 0, 'minor': 0, 'patch': 0}

    for container in containers:
        test_image = DockerImage(container.id)
        if is_newer(test_image):
            current_version['major'] = test_image.version['major']
            current_version['minor'] = test_image.version['minor']
            current_version['patch'] = test_image.version['patch']
            current_image = test_image

    save_state()
