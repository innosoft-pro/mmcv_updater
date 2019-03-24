import {observable} from 'mobx';
import axios from 'axios';

class SyncStore {
    @observable currentDate = '';
    @observable currentTime = '';
    @observable timezonesList = [];
    @observable defaultTZ = '';
    @observable defaultNTP = '';
    @observable date = null;
    @observable time = null;
    @observable TZ = '';
    @observable NTP = '';

    start(interval = 1000) {
        this.fetchTimezonesList();
        this.fetchDefaultTZ();
        this.fetchDefaultNTP();
        this.fetchCurrentTime(interval);
        this.intervalObject = setInterval(() => {
            this.fetchCurrentTime(interval)
        }, interval);
    }

    stop() {
        clearInterval(this.intervalObject);
    }

    fetchDefaultNTP() {
        axios.get('/configurator/defaultNTP').then((response) => {
            if (response.data) {
                this.defaultNTP = response.data.NTP;
            }
        })
    }

    fetchDefaultTZ() {
        axios.get('/configurator/defaultTZ').then((response) => {
            if (response.data) {
                this.defaultTZ = response.data.TZ;
                this.TZ = response.data.TZ;
            }
        })
    }

    fetchTimezonesList() {
        axios.get('/configurator/timezonesList').then((response) => {
            if (response.data) {
                this.timezonesList = response.data;
            }
        })
    }

    fetchCurrentTime(timeout) {
        axios.get('/configurator/currentDateTime', {timeout: timeout}).then((response) => {
            if (response.data) {
                this.currentDate = response.data.date;
                this.currentTime = response.data.time;
            }
        })
    }
}

export default SyncStore;
