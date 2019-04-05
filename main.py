from UpdateManager import UpdateManager
from inputs.FlashDriveInput import FlashDriveInput

if __name__ == '__main__':
    up_manager = UpdateManager()
    fd_input = FlashDriveInput(up_manager)

    # TODO : prototype version, add proper exit condition, if any
    while True:
        pass
