from inputs.FlashDriveInput import FlashDriveInput
from heartbeat import heartbeat
import error_view

if __name__ == '__main__':
    fd_input = FlashDriveInput()
    heartbeat.start()
    error_view.app.run()
    heartbeat.cancel()

    # TODO : prototype version, add proper exit condition, if any
    # while True:
    #    pass
