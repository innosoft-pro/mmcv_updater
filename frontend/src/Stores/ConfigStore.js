import {action, computed, observable} from 'mobx';
import axios from 'axios';
import {notification} from 'antd';

import {translateDirection} from './../utils';

var hri = require('human-readable-ids').hri;

const DefaultConfig = {
    base_config: {
        camera_id: 1,
        interval: 300
    },
    markup_config: {
        active_areas: [],
        lanes: [],
        support_lines: []
    },
    speed_lines: {
        forward: {
            line1_name: null,
            line2_name: null,
            distance: 30
        },
        backward: {
            line1_name: null,
            line2_name: null,
            distance: 30
        }
    }
};

export class ConfigStore {
    @observable config = JSON.parse(JSON.stringify(DefaultConfig));

    @observable currentConnectionString;
    @observable loading;
    @observable selectedLine = '';
    @observable lineNameVisible = true;

    @computed get finalConfig() {
        let clone = JSON.parse(JSON.stringify(this.config));
        for (let lane of clone.markup_config.lanes)
            lane.speed_line_pair = clone.speed_lines[lane.direction];
        delete clone.speed_lines;
        return clone;
    }

    static isLaneContainLine(lane, line_name) {
        return lane.counting_line_name === line_name;
    }

    getLines() {
        return Array.from(this.config.markup_config.support_lines);
    }

    getAreaLines() {
        return Array.from(this.config.markup_config.active_areas.map((area) => area.line))
    }

    saveConfig() {
        return axios.post('/configurator/config/edit', {
            connection_string: this.currentConnectionString,
            base_config: this.finalConfig.base_config,
            markup_config: this.finalConfig.markup_config
        });
    }

    generateRandomLineName() {
        return hri.random();
    }

    @action
    addLine(points) {
        const line = {line_name: this.generateRandomLineName(), pixels: points};
        if (points.length > 2) {
            const area = {line: line, classes: ['person', 'car', 'truck', 'bus', 'unclassified'], reasons: ['stopped', 'long_living']};
            this.config.markup_config.active_areas.push(area);
        } else
            this.config.markup_config.support_lines.push(line);

    }

    isSpeedFixationUsesLine(line_name) {
        return this.config.speed_lines.forward.line1_name === line_name
            || this.config.speed_lines.forward.line2_name === line_name
            || this.config.speed_lines.backward.line1_name === line_name
            || this.config.speed_lines.backward.line2_name === line_name;
    }

    @action
    deleteLine(line_name) {
        let {support_lines, lanes, active_areas} = this.config.markup_config;
        let index = support_lines.findIndex(supp_line => supp_line.line_name === line_name);
        if (index > -1) {
            let lanesThatContains = lanes.filter((lane) => ConfigStore.isLaneContainLine(lane, line_name));
            if (lanesThatContains.length === 0) {
                if (!this.isSpeedFixationUsesLine(line_name)) {
                    support_lines.splice(index, 1);
                } else {
                    notification['error']({
                        message: `Линия ${line_name} уже используется в фиксации скорости`,
                    });
                }
            } else {
                let all_lanes = lanesThatContains.map((lane) => `(${translateDirection(lane.direction)}, ${lane.number})`)
                    .reduce((prevString, currString) => prevString + ' ' + currString);

                notification['error']({
                    message: `Линия ${line_name} уже используется в ${all_lanes})`,
                });
            }
        } else {
            const active_areas_index = active_areas.findIndex(area => area.line.line_name === line_name);
            if (active_areas_index > -1)
                active_areas.splice(active_areas_index, 1);
        }
    }

    @action
    dropConfigurationToDefault() {
        this.config = JSON.parse(JSON.stringify(DefaultConfig));
    }

    @action
    dropMarkupToDefault() {
        let defaultConfig = JSON.parse(JSON.stringify(DefaultConfig));
        this.config.markup_config = defaultConfig.markup_config;
        this.config.speed_lines = defaultConfig.speed_lines;
    }

    fetchCurrentConfig() {
        this.loading = true;
        axios.get('/configurator/config').then((response) => {
            this.loading = false;
            if (response.data) {
                const {base_config, markup_config, connection_string} = response.data;
                if (base_config)
                    this.config.base_config = base_config;
                if (markup_config) {
                    if (markup_config.active_areas === undefined)
                        markup_config.active_areas = [];
                    this.config.markup_config = markup_config;
                    const first_forward_lane = markup_config.lanes.find((lane) => lane.direction === 'forward');
                    if (first_forward_lane !== undefined)
                        this.config.speed_lines.forward = first_forward_lane.speed_line_pair;
                    const first_backward_lane = markup_config.lanes.find((lane) => lane.direction === 'backward');
                    if (first_backward_lane !== undefined)
                        this.config.speed_lines.backward = first_backward_lane.speed_line_pair;

                }
                if (connection_string)
                    this.currentConnectionString = connection_string;
                else
                    this.fetchConnectionString()
            }
        }).catch((e) => this.loading = false);
    }

    fetchConnectionString() {
        axios.get('/configurator/getConnectionString')
            .then((response) => {
                if (response.data.connection_string)
                    this.currentConnectionString = response.data.connection_string;
                else
                    this.currentConnectionString = ''
            })
            .catch((e) => {
                this.currentConnectionString = ''
            })
    }

}

export default ConfigStore;