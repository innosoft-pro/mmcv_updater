import docker


class DockerImage:
    def __init__(self, image_file_path, image_file_name):
        self.image_file_path = image_file_path
        self.image_file_name = image_file_name

        self.docker = docker.from_env()

        self.image = None
        self.container = None

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
            self.container = self.docker.containers.run(self.image[0].tags[0])

    def stop(self):
        if self.container is not None:
            self.container.stop()
            self.container = None
