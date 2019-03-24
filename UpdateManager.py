import os
from Config import Config
from images.DockerImage import DockerImage


# TODO: Make static
class UpdateManager:

    def __init__(self):
        self.inputs = list()
        self.current_image = None
        current_image_type = (Config().get_parser())["common"]["current_image"]

        if current_image_type == "docker":
            self.current_image = DockerImage(Config().get_parser()["docker"]["current_container"])

    def input_updated(self, device_input):
        # TODO: Probably check that the caller is in our inputs list
        image = device_input.find_image()
        self.update(image)

    def add_input(self, device_input):
        self.inputs.append(device_input)

    def have_free_space(self, size):
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

    def update(self, image):
        # TODO : Add proper error handling
        if not self.have_free_space(image.image_size):
            return self.error_notification("Not enough space to install the image")
        self.current_image.stop()
        image.install()
        image.run()

        # Save the info for later
        version_string = f"{image.version['major']}.{image.version['minor']}.{image.version['patch']}"
        Config().write("common", "current_version", version_string)
        Config().write("common", "current_image", image.image_type)
        image.save_info()

    def error_notification(self, error):
        # TODO: more detailed error notification, integrate with the system itself
        print(error)
        return False

    # Docker memory size usage:
    # docker image inspect [name] --format='{{.Size}}'
    # docker ps -s --all
    # Readable layers are the same size between different containers (virtual size)
    # Writable layers are per container
