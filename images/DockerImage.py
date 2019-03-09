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
        with open(f"{self.image_file_path}/{self.image_file_name}", "rb") as image_file:
            self.image = self.docker.images.load(image_file.read())
        return True

    def delete(self):
        self.container.stop()
        self.docker.images.remove(self.image[0].tags[0])

    def run(self):
        self.container = self.docker.containers.run(self.image[0].tags[0])

    def stop(self):
        self.container.stop()
