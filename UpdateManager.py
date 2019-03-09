class UpdateManager:

    def __init__(self):
        self.inputs = list()

    def input_updated(self, device_input):
        # TODO: Probably check that the caller is in our inputs list
        print("Input updated!")
        image = device_input.find_image()
        self.update(image)
        pass

    def add_input(self, device_input):
        self.inputs.append(device_input)

    def update(self, image):
        # TODO : Add proper error handling
        # TODO : Add memory size checking
        image.install()
        image.run()
