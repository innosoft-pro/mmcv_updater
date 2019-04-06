import {observable} from 'mobx';
import * as axios from 'axios';
import moment from 'moment';
import numeral from 'numeral';

moment.locale('ru');

class LogsStore {

    @observable cameraState = {
        text: 'Камера',
        status: null,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'false': {
                status: 'error',
                message: 'Нет соединения'
            },
            'true': {
                status: 'success',
                message: 'Подключено'
            }
        }
    };
    @observable baseConfigState = {
        text: 'Базовая конфигурация',
        status: null,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'false': {
                status: 'error',
                message: 'Не задана'
            },
            'true': {
                status: 'success',
                message: 'Задана'
            }
        }
    };
    @observable markupConfigState = {
        text: 'Конфигурация разметки',
        status: null,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'false': {
                status: 'error',
                message: 'Не задана'
            },
            'true': {
                status: 'success',
                message: 'Задана'
            }
        }
    };
    @observable pipelineState = {
        text: 'Состояние системы',
        status: null,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступна',
            },
            'stopped': {
                status: 'default',
                message: 'Остановлена'
            },
            'failed': {
                status: 'error',
                message: 'Ошибка'
            },
            'working': {
                status: 'success',
                message: 'Работает'
            },
            'starting': {
                status: 'processing',
                message: 'Запускается'
            }
        }
    };
    @observable uptimeStatus = {
        text: 'Аптайм',
        status: null,
        statusIsValue: true,
        renderable: true,
        render: (value) => {
            return (numeral(value)).format('00:00:00');
        },
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'default': {
                status: 'success',
                message: ''
            }
        }
    };
    @observable timeSyncStatus = {
        text: 'Синхронизация времени',
        status: null,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'false': {
                status: 'error',
                message: 'Ошибка'
            },
            'true': {
                status: 'success',
                message: 'Выполнена'
            }
        }
    };
    @observable carCounterStatus = {
        text: 'Количество машин',
        status: null,
        statusIsValue: true,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'default': {
                status: 'success',
                message: ''
            }
        }
    };
    @observable cpuStatus = {
        text: 'CPU Usage',
        status: null,
        statusIsValue: true,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'default': {
                status: 'success',
                message: ''
            }
        }
    };
    @observable ramStatus = {
        text: 'RAM Usage',
        status: null,
        statusIsValue: true,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'default': {
                status: 'success',
                message: ''
            }
        }
    };
    @observable systemType = {
        text: 'Тип системы',
        status: null,
        statusIsValue: true,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'default': {
                status: 'success',
                message: ''
            }
        }
    };

    @observable systemVersion = {
        text: 'Версия системы',
        status: null,
        statusIsValue: true,
        statusDescription: {
            'null': {
                status: 'warning',
                message: 'Недоступно',
            },
            'default': {
                status: 'success',
                message: ''
            }
        }
    };

    intervalObject = null;
    statusList = [
        'cameraState',
        'baseConfigState',
        'markupConfigState',
        'pipelineState',
        'uptimeStatus',
        'timeSyncStatus',
        'carCounterStatus',
        'cpuStatus',
        'ramStatus',
        'systemType',
        'systemVersion'
    ];

    constructor() {
        this.start();
    }

    start(interval = 5000) {
        this.fetchStatus(interval);
        if (this.interval != null) {
            clearInterval(interval);
        }
        this.intervalObject = setInterval(() => {
            this.fetchStatus(interval)
        }, interval);
    }

    fetchStatus(timeout) {
        axios.get('/configurator/status', {timeout: timeout}).then((response) => {
            if (response.data)
                this.fromJSON(response.data);
        })
    }

    fromJSON(json) {
        if (json.camera != 'undefined') {
            this.cameraState.status = json.camera;
        }
        if (json.base_config != 'undefined') {
            this.baseConfigState.status = json.base_config;
        }
        if (json.markup_config != 'undefined') {
            this.markupConfigState.status = json.markup_config;
        }
        if (json.pipeline_status != 'undefined') {
            this.pipelineState.status = json.pipeline_status;
        }
        if (json.uptime != 'undefined') {
            this.uptimeStatus.status = json.uptime;
        }
        if (json.timesync != 'undefined') {
            this.timeSyncStatus.status = json.timesync;
        }
        if (json.counted != 'undefined') {
            this.carCounterStatus.status = json.counted;
        }
        if (json.cpu != 'undefined') {
            this.cpuStatus.status = json.cpu;
        }
        if (json.ram != 'undefined') {
            this.ramStatus.status = json.ram;
        }
        if (json.system_type != 'undefined') {
            this.systemType.status = json.system_type;
        }

        if (json.system_version != 'undefined') {
            this.systemVersion.status = json.system_version;
        }
    }
}

export default LogsStore;