import {action, map, observable} from 'mobx';
import axios from 'axios';
import {notification} from "antd";


class VideoStore {
    @observable isRunning = false;
    @observable selectedKey = null;
    @observable videos = map();

    @action
    updateVideoList() {
        axios.get('/configurator/videoDirectory').then((response) => {
                this.videos.clear();
                this.videos.merge(response.data);
            }
        )
    }

    @action
    updateStatus() {
        axios.get('/configurator/currentVideoState').then(
            (response) => {
                const resp = response.data;
                if (resp.isRunning !== this.isRunning) {
                    this.isRunning = resp.isRunning;
                    this.selectedKey = resp.selectedKey;
                    notification['success']({
                        message: 'Система уже ' + (resp.isRunning ? 'запущена' : 'остановлена'),
                    });
                }
            }
        )
    }


    @action
    setCurrentKeyConfig() {
        let currentValue = this.videos.get(this.selectedKey);
        currentValue.has_config = true;
        this.videos.set(this.selectedKey, currentValue);
    }

    getSelectedThumbnail() {
        return 'url(data:image/png;base64,' + this.videos.toJS()[this.selectedKey].first_frame + ')'
    }
}

export default VideoStore;
