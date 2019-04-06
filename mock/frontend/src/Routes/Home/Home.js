import * as React from 'react';
import axios from 'axios';
import AppStatus from './AppStatus';
import {inject, observer} from 'mobx-react';
import {Button, Card, Col, Icon, notification, Row, Spin, Upload} from 'antd';
import PureStream from '../../ReusableComponents/PureStream';


@inject('routing', 'logsStore', 'config')
@observer
export class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connectionString: '',
            fetching: false,
        }
    }

    stopPipeline() {
        axios.post('/configurator/stopPipeline').then(
            (response) => {
                if (response.data) {
                    let resp = response.data;
                    if (resp.result === true) {
                        notification['success']({
                            message: 'Система остановлена',
                        });
                        this.props.logsStore.pipelineState.status = 'stopped';
                    } else {
                        notification['error']({
                            message: 'Ошибка при остановке системы',
                            description: resp.message
                        });
                        this.props.logsStore.pipelineState.status = 'null';
                    }
                }
            }
        ).catch((error) => {
            let e = {...error};
            if (e.response.data) {
                let resp = e.response.data;
                if (resp.result === true) {
                    notification['success']({
                        message: 'Система остановлена',
                    });
                    this.props.logsStore.pipelineState.status = 'stopped';
                } else {
                    notification['error']({
                        message: 'Ошибка при остановке системы',
                        description: resp.message
                    });
                    this.props.logsStore.pipelineState.status = 'null';
                }
            }
        })
    }

    startPipeline() {
        this.props.logsStore.pipelineState.status = 'starting';
        axios.post('/configurator/runPipeline').then(
            (response) => {
                if (response.data) {
                    let resp = response.data;
                    if (resp.result === true) {
                        notification['success']({
                            message: 'Система успешно запущена',
                        });
                    } else {
                        notification['error']({
                            message: 'Ошибка при запуске системы',
                            description: resp.message
                        })
                    }
                }
                this.props.logsStore.pipelineState.status = 'working';
            }
        ).catch((error) => {
            let e = {...error};
            if (e.response.data) {
                let resp = e.response.data;
                if (resp.result === true) {
                    notification['success']({
                        message: 'Система успешно запущена',
                    });
                } else {
                    notification['error']({
                        message: 'Ошибка при запуске системы',
                        description: resp.message
                    })
                }
            }
            this.props.logsStore.pipelineState.status = 'stopped';
        })
    }

    render() {
        const cameraStatus = this.props.logsStore.cameraState.status;
        const pipelineStatus = this.props.logsStore.pipelineState.status;
        const configs_available = this.props.logsStore.baseConfigState.status
            && this.props.logsStore.markupConfigState.status;

        const highlightConfigureButton = !(cameraStatus && configs_available);
        const disableConfigureButton = pipelineStatus === 'working' || pipelineStatus === 'starting';
        const disableStartButton = pipelineStatus === 'working' || !configs_available;

        return (
            <Spin spinning={this.state.fetching} size='large'>
                <div>
                    <Row className='margin_top_10'>
                        <Col offset={16} span={3}>
                            <Button className='full_width' type='ghost' size='large'
                                    onClick={(e) => {
                                        axios.get('/configurator/reboot');
                                    }}>Перезагрузить SBC
                            </Button>
                        </Col>
                        <Col span={3} offset={2}>
                            <Button className='full_width' type='ghost' size='large'
                                    onClick={(e) => {
                                        axios.get('/configurator/shutdown');
                                    }}
                                    disabled>Выключить SBC
                            </Button>
                        </Col>
                    </Row>
                    <Row className='margin_top_10'>
                        <Col lg={15} md={15} xs={24} span={15}>
                            <PureStream
                                url={this.props.logsStore.cameraState.status ? `url(/configurator/videoFeed)` : null}/>
                        </Col>
                        <Col lg={{span: 8, offset: 1}} xs={{span: 24, offset: 0}} md={{span: 8, offset: 1}}>
                            <Card title='Статус' className='min_width_150' bordered={true} style={{width: '100%'}}
                                  bodyStyle={{padding: 0}}>
                                <AppStatus/>
                            </Card>
                        </Col>
                    </Row>
                    <Row className='margin_top_40'>
                        <Col span={15}>
                            <Button className='full_width' type='primary' size='large'
                                    loading={this.props.logsStore.pipelineState.status === 'starting'}
                                    disabled={disableStartButton}
                                    onClick={(e) => {
                                        this.startPipeline();
                                    }}>Запустить систему</Button>
                        </Col>
                        <Col span={8} offset={1}>
                            <Button className='full_width' size='large'
                                    disabled={disableConfigureButton}
                                    type={highlightConfigureButton ? 'primary' : 'default'}
                                    onClick={(e) => {
                                        this.props.routing.push('/config');
                                    }}>Сконфигурировать</Button>
                        </Col>
                    </Row>
                    <Row className='margin_top_10'>
                        <Col span={15}>
                            <Button className='full_width' type='danger' size='large'
                                    disabled={this.props.logsStore.pipelineState.status !== 'working'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.stopPipeline();
                                    }}>Остановить систему</Button>
                        </Col>
                        <Col span={8} offset={1}>
                            <Button className='full_width' size='large'
                                    disabled={disableConfigureButton}
                                    onClick={(e) => {
                                        this.props.routing.push('/sync');
                                    }}>Синхронизировать время</Button>
                        </Col>
                    </Row>
                    <Row className='margin_top_10'>
                        <Col span={7}>
                            <a href="/configurator/config/download">
                                <Button className='full_width' type='ghost' size='large'>
                                    <Icon type="download"/> Скачать конфиг
                                </Button>
                            </a>
                        </Col>
                        <Col span={7} offset={1}>
                            <Upload onChange={(info) => {
                                const status = info.file.status;
                                const response = info.file.response;
                                if (status === 'done') {
                                    notification['success']({message: 'Конфиг успешно загружен'});
                                    this.props.config.fetchCurrentConfig();
                                } else if (status === 'error') {
                                    notification['error']({
                                        message: 'Произошла ошибка',
                                        description: response ? response.message : undefined
                                    });
                                }
                            }} showUploadList={false} action='/configurator/config/upload' accept='.json'>
                                <Button className='full_width' type='ghost' size='large'
                                        disabled={disableConfigureButton}>
                                    <Icon type="upload"/> Загрузить конфиг
                                </Button>
                            </Upload>
                        </Col>
                        <Col span={8} offset={1}>
                            <Button className='full_width' type='ghost' size='large'
                                    disabled={this.props.logsStore.pipelineState.status !== 'working'}
                                    onClick={(e) => {
                                        this.props.routing.push('/debug');
                                    }}>Отладочная информация</Button>
                        </Col>
                    </Row>
                </div>
            </Spin>
        )
    }
}

export default Home;
