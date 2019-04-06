import {observable} from 'mobx';
import axios from 'axios';

class DebugStore {
    @observable cameraFilters = [];
    @observable videoFilters = [];

    constructor() {
        this.start();
    }

    start(interval = 5000) {
        if (this.intervalObject === undefined) {
            this.fetchPipelineLoad('camera', interval);
            this.fetchPipelineLoad('video', interval);
            this.intervalObject = setInterval(() => {
                this.fetchPipelineLoad('camera', interval);
                this.fetchPipelineLoad('video', interval);
            }, interval);
        }
    }

    fetchPipelineLoad(type, timeout) {
        axios.get('/configurator/pipeline_load?type=' + type, {timeout: timeout}).then((response) => {
            if (response.data) {
                if (type === 'camera')
                    this.cameraFilters = response.data;
                if (type === 'video')
                    this.videoFilters = response.data;
            }
        })
    }

}

export default DebugStore;
