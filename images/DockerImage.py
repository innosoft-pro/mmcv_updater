import math
import os

import docker

from Config import Config


class DockerImage:
    def __init__(self, container_id=None):
        self.image_file_path = None
        self.image_file_name = None

        self.docker = docker.from_env()

        self.image = None
        self.container = None

        self.version = dict(major=0, minor=0, patch=0)

        self.image_type = "docker"

        images = self.docker.containers.list(filters=dict(id=container_id))
        self.image_size = math.inf
        # Something went really wrong if there are more than 1 container with the same id
        if len(images) == 1:
            self.container = images[0]
            self.image = self.container.image

    def from_file(self, image_file_path, image_file_name, major, minor, patch):
        self.image_file_path = image_file_path
        self.image_file_name = image_file_name

        # Docker image size is difficult to completely calculate with the tools provided by Docker itself.
        # Instead, the tar's size is taken as an approximation
        # Based on very few samples, this approximation can vary from 20% increase to 80%
        # Write-layer is not calculated either way, so this part can actually help a bit
        self.image_size = os.stat(self.image_file_path + "/" + self.image_file_name).st_size

        self.version["major"] = major
        self.version["minor"] = minor
        self.version["patch"] = patch

    def install(self):
        # TODO : add error handling here
        # docker.load requires the binary contents of a tarball with the image data
        with open(f"{self.image_file_path}/{self.image_file_name}", "rb") as image_file:
            contents = image_file.read()
            self.image = self.docker.images.load(contents)
        return True

    def delete(self):
        if self.container is not None:
            self.container.stop()
        # TODO : smarter image retrieval. image[0].tags[0] will probably always work, but still
        self.docker.images.remove(self.image[0].tags[0])

    def run(self):
        # Only run 1 copy of the image, I assume?
        # TODO : error retrieval and user notification
        if self.container is None:
            self.container = self.docker.containers.run(self.image[0].tags[0], detach=True)

    def stop(self):
        if self.container is not None:
            self.container.stop()
            self.container = None

    def save_info(self):
        Config().write("docker", "current_container", self.container.id)