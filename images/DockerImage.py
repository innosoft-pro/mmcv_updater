import math
import os

import re
import tarfile

import docker

import Config


class DockerImage:
    def __init__(self, container_id=None):
        # Filesystem-related information. Unused for images that are already loaded
        self.image_file_path = None
        self.image_file_name = None

        # Docker-related variables
        self.docker = docker.from_env()
        self.image = None
        self.container = None

        # Common image variables
        self.version = dict(major=0, minor=0, patch=0)
        self.image_type = "docker"

        # Size detection
        images = self.docker.containers.list(filters=dict(id=container_id))
        self.image_size = math.inf
        # Something went really wrong if there are more than 1 container with the same id
        if len(images) == 1:
            self.container = images[0]
            self.image = self.container.image
            # NOTE: df is a bit slow since it obtains ALL the resource information during the call.
            # Runtime size is not available as a
            dockerdf = self.docker.df()["Containers"]
            for info in dockerdf:
                # We might have a partial ID during first run
                if container_id in info["Id"]:
                    self.image_size = info["SizeRootFs"]

    @staticmethod
    def from_file(image_file_path, image_file_name, major, minor, patch):
        file_path = image_file_path + "/" + image_file_name

        if os.path.exists(file_path):
            ret = DockerImage()

            ret.image_file_path = image_file_path
            ret.image_file_name = image_file_name

            # Docker image size is difficult to completely calculate with the tools provided by Docker itself.
            # Instead, the tar's size is taken as an approximation
            # Based on very few samples, this approximation can vary from 20% increase to 80%
            # Write-layer is not calculated either way, so this part can actually help a bit
            ret.image_size = os.stat(file_path).st_size

            ret.version["major"] = major
            ret.version["minor"] = minor
            ret.version["patch"] = patch
            return ret
        return None

    def install(self):
        try:
            # docker.load requires the binary contents of a tarball with the image data
            with open(f"{self.image_file_path}/{self.image_file_name}", "rb") as image_file:
                contents = image_file.read()
                self.image = self.docker.images.load(contents)
            return True
        except FileNotFoundError:
            # TODO: Integrate with the runtime error notification
            pass
        return False

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
        Config.write("docker", "current_container", self.container.id)

    @staticmethod
    def get_image(path, filename):
        """
        Try to get an image from a specified file
        :param path: path to the file
        :param filename: name of the file to check
        :return: Docker image if the file is indeed an image, None otherwise
        """
        match = re.search(r"mmcv_(core|incidents|trucks)_(x86|rpi)-(\d+)\.(\d+)\.(\d+)\.tar", filename)
        image = None
        if match is not None:
            # TODO: also check that the update is compatible by architecture.
            # The current problem - there are a lot of possible names that can be acquired via platform.machine()
            # Some of them are x86, some x64, raspberry pi seem to have their own naming
            # Index tables COULD be used, but may be a bit of a hassle to update later.
            # As in, we'll need to update the updater.
            up_major = match.group(3)
            up_minor = match.group(4)
            up_patch = match.group(5)

            # We have a correct name, check the contents next
            try:
                with tarfile.open(path + "/" + filename, "r") as tar:
                    # Quick check - packed docker images have a number of layers with metadata (a folder and 3 files)
                    # Also these 2 files and a description json? (Not sure, the filename is an id-named json)
                    # TODO: for added security, maybe check the presence of layer data - 1 folder, 3 files per layer.
                    tar.getmember("manifest.json")
                    tar.getmember("repositories")
            except KeyError:
                # The tarfile is not a docker image, do nothing
                pass
            except FileNotFoundError:
                # The tarfile doesn't exist
                pass
            else:
                image = DockerImage.from_file(path, filename, up_major, up_minor, up_patch)
        return image

    def get_errors(self):
        if self.container is not None:
            return self.container.logs(stdout=False, stderr=True, timestamps=True)
