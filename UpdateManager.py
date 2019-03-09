class UpdateManager:

    def __init__(self):
        self.inputs = list()

    def input_updated(self, device_input):
        print("Input updated!")
        image = device_input.find_image()
        pass

    def add_input(self, device_input):
        self.inputs.append(device_input)

    def update(self, image):
        pass
