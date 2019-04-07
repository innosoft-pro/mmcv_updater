import os
from Config import Config
from images.DockerImage import DockerImage

inputs = list()
current_image = None
current_image_type = Config.parser["common"]["current_image"]

if current_image_type == "docker":
    current_image = DockerImage(Config.parser["docker"]["current_container"])


def input_updated(device_input):
    # TODO: Probably check that the caller is in our inputs list
    image = device_input.find_image()
    update(image)


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
