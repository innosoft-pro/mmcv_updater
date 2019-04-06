import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import JSONPretty from 'react-json-pretty';
import {Button, Collapse, Modal, notification, Popconfirm, Steps} from 'antd';
import axios from 'axios';

import MarkupStep from './Steps/MarkupStep';
import SpeedMarkupStep from './Steps/SpeedMarkupStep';
import IncidentsMarkupStep from "./Steps/IncidentsMarkupStep";

const Step = Steps.Step;


@inject('config', 'logsStore', 'routing', 'videoStore')
@observer
class VideoConfiguration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0
        };
    }

    next() {
        const current = this.state.current + 1;
        this.setState({current});
        window.scrollTo(0, 0);
    }

    prev() {
        const current = this.state.current - 1;
        this.setState({current});
        window.scrollTo(0, 0);
    }

    dropConfig() {
        this.props.config.dropConfigurationToDefault();
        this.setState({current: 0});
        notification['success']({
            message: 'Конфигурация успешно сброшена.',
            description: 'Тем не менее, она не была удалена (как и строка подключения). Перезагрузите страницу чтобы вернуть всё обратно.'
        });
    }

    saveConfig() {
        let body = {
            markup_config: toJS(this.props.config.finalConfig).markup_config,
            selected_video: this.props.videoStore.selectedKey
        };
        axios.post('/configurator/saveVideoConfig', body).then((response) => {
            if (response.data) {
                let resp = response.data;
                if (resp.result === true) {
                    notification['success']({
                        message: 'Конфигурация для видео сохранена'
                    });
                    this.props.routing.push('/video');
                    this.props.videoStore.setCurrentKeyConfig();
                } else {
                    notification['error']({
                        message: 'Ошибка сохранения конфигурации',
                        description: resp.message
                    });
                }
            }
        }).catch((error) => {
            let e = {...error};
            if (e.response.data) {
                let resp = e.response.data;
                if (resp.result === true) {
                    notification['success']({
                        message: 'Конфигурация для видео сохранена'
                    });
                    this.props.routing.push('/video');
                    this.props.videoStore.setCurrentKeyConfig();
                } else {
                    notification['error']({
                        message: 'Ошибка сохранения конфигурации',
                        description: resp.message
                    });
                }
            }
        })
    }

    render() {
        const {current} = this.state;
        let showJs = toJS(this.props.config.finalConfig);
        let videoUrl = '';
        if (this.props.videoStore.isRunning) {
            videoUrl = `url(/configurator/runOnVideoFeed)`;
        } else if (this.props.videoStore.selectedKey) {
            videoUrl = this.props.videoStore.getSelectedThumbnail();
        }
        let ConfigSteps;
        if (this.props.logsStore.systemType.status === 'incidents')
            ConfigSteps = [{
                title: 'Область распознавания',
                content: <IncidentsMarkupStep url={videoUrl}/>
            }];
        else
            ConfigSteps = [{
                title: 'Линии подсчёта',
                content: <MarkupStep url={videoUrl}/>
            }, {
                title: 'Линии скоростей',
                content: <SpeedMarkupStep url={videoUrl}/>
            }];
        window.scrollTo(0, 0);
        return (
            <div>
                <Modal
                    title={'Конфигурирование недоступно'}
                    visible={this.props.logsStore.pipelineState.status === 'working'}
                    closable={false}
                    footer={
                        <Button type='primary' onClick={(e) => {
                            this.props.routing.push('/');
                        }}>
                            На главную
                        </Button>
                    }>
                    Система уже запущена. Остановите систему, затем продолжите конфигурирование.
                </Modal>
                <Steps current={current}>
                    {ConfigSteps.map(item => <Step key={item.title} title={item.title}/>)}
                </Steps>
                <div className='steps-content'>{ConfigSteps[this.state.current].content}</div>
                <div className='steps-action'>
                    {
                        this.state.current < ConfigSteps.length - 1
                        &&
                        <Button type='primary' onClick={() => this.next()}>Следующий шаг</Button>
                    }
                    {
                        this.state.current === ConfigSteps.length - 1
                        &&
                        <Button type='primary' onClick={() => this.saveConfig()}>Сохранить конфигурацию</Button>
                    }
                    {
                        this.state.current > 0
                        &&
                        <Button style={{marginLeft: 12}} onClick={() => this.prev()}>
                            Назад
                        </Button>
                    }

                    <Popconfirm title="Точно хотите сбросить текущую конфигурацию?"
                                okText="Да"
                                cancelText="Нет"
                                onConfirm={() => this.dropConfig()}
                                placement="topRight">
                        <Button className='float_right' type='danger'>
                            Сбросить текущую конфигурацию и вернуться в начало
                        </Button>
                    </Popconfirm>
                </div>
                <div className='margin_top_40'>
                    <Collapse className='full_width' accordion>
                        <Collapse.Panel header={'Показать текущую конфигурацию'} key={'currConfig'}>
                            <JSONPretty json={showJs}/>
                        </Collapse.Panel>
                    </Collapse>
                </div>
            </div>
        );
    }
}

export default VideoConfiguration;