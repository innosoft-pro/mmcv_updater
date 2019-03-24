import * as React from 'react';
import {AutoComplete, Button, Col, Icon, notification, Row} from 'antd';
import {inject, observer} from 'mobx-react';
import axios from 'axios';
import {Bar, CartesianGrid, ComposedChart, Legend, Tooltip, XAxis, YAxis} from 'recharts';


import PureStream from '../../ReusableComponents/PureStream';

@inject('debugStore', 'routing', 'videoStore')
@observer
class VideoRunner extends React.Component {
    constructor(props) {
        super(props);
        this.props.videoStore.updateVideoList();
    }

    runOnVideo() {
        let selectedVideo = this.props.videoStore.selectedKey;
        axios.get('/configurator/runOnVideo?selected_video=' + selectedVideo).then(
            (response) => {
                if (response.data) {
                    let resp = response.data;
                    if (resp.result === true) {
                        notification['success']({
                            message: 'Отладка на видео запущена',
                        });
                        this.props.videoStore.isRunning = true;
                    } else {
                        notification['error']({
                            message: 'Ошибка при запуске системы',
                            description: resp.message
                        })
                    }
                }
            }
        ).catch((error) => {
            let e = {...error};
            if (e.response.data) {
                let resp = e.response.data;
                notification['error']({
                    message: 'Ошибка при запуске системы',
                    description: resp.message
                });
                this.props.videoStore.isRunning = false;
            }
        });
    }

    stopVideo() {
        axios.get('/configurator/stopVideo').then(
            (response) => {
                if (response.data) {
                    let resp = response.data;
                    if (resp.result === true) {
                        notification['success']({
                            message: 'Система успешно остановлена',
                        });
                        this.props.videoStore.isRunning = false;
                    } else {
                        notification['error']({
                            message: 'Не удалось остановить систему',
                            description: resp.message
                        })
                    }
                }
            }
        ).catch((error) => {
            let e = {...error};
            if (e.response.data) {
                let resp = e.response.data;
                notification['error']({
                    message: 'Ошибка при остановке системы',
                    description: resp.message
                });
                this.props.videoStore.isRunning = false;
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        this.props.videoStore.updateStatus()
    }

    render() {
        this.props.videoStore.updateStatus();
        const videos = this.props.videoStore.videos.toJS();
        const selectedKey = this.props.videoStore.selectedKey;
        const runDisabled = selectedKey === null || videos[selectedKey] === undefined;

        let videoUrl = '';
        if (this.props.videoStore.isRunning)
            videoUrl = `url(/configurator/runOnVideoFeed)`;
        else if (this.props.videoStore.selectedKey && videos[selectedKey] !== undefined)
            videoUrl = this.props.videoStore.getSelectedThumbnail();
        return (
            <div>
                <Row gutter={16}>
                    <Col span={16}>
                        <AutoComplete
                            className='full_width'
                            dataSource={Object.keys(videos)}
                            placeholder='search for your videos'
                            filterOption={(inputValue, option) =>
                                option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                            onSelect={(value) => this.props.videoStore.selectedKey = value}
                            onChange={(value) => {
                                let key = null;
                                if (Object.keys(videos).includes(value)) {
                                    key = value;
                                }
                                this.props.videoStore.selectedKey = key;
                            }}
                            defaultValue={this.props.videoStore.selectedKey}
                        />
                    </Col>
                    <Col span={8}>
                        {
                            !this.props.videoStore.isRunning &&
                            <Button className='full_width'
                                    type='primary'
                                    onClick={() => this.runOnVideo()}
                                    disabled={runDisabled}>
                                <Icon type='play-circle'/> Запустить
                            </Button>
                            ||
                            <Button className='full_width'
                                    type='danger'
                                    onClick={() => {
                                        this.stopVideo()
                                    }}>
                                <Icon type='pause-circle'/> Остановить
                            </Button>
                        }
                    </Col>
                </Row>
                <Row className='margin_top_10'>
                    <Col span={24}>
                        <Button className='full_width'
                                type={runDisabled ? 'primary' : 'default'}
                                onClick={() => this.props.routing.push('/videoConfig')}
                                disabled={!this.props.videoStore.selectedKey}>
                            Сконфигурировать
                        </Button>
                    </Col>
                </Row>
                <Row className='margin_top_40' gutter={16}>
                    <Col span={12}>
                        <PureStream
                            url={videoUrl}/>
                    </Col>
                    <Col span={12}>
                        <PureStream url={this.props.videoStore.isRunning ?
                            `url(/configurator/runOnVideoFeedBGS)` : ''}/>
                    </Col>
                </Row>
                <Row className='margin_top_40' gutter={16}>
                    <Col span={12}>
                        <PureStream url={this.props.videoStore.isRunning ?
                            `url(/configurator/runOnVideoFeedTF)` : ''}/>
                    </Col>
                    <Col span={12}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <ComposedChart layout="vertical" width={600} height={500}
                                           data={Array.from(this.props.debugStore.videoFilters)}
                                           margin={{top: 10, right: 20, left: 20, bottom: 5}}>
                                <XAxis type="number"/>
                                <YAxis width={100} dataKey="name" type="category"/>
                                <Tooltip/>
                                <Legend/>
                                <CartesianGrid stroke='#f5f5f5'/>
                                <Bar dataKey="load" barSize={20} fill="#42aaff"/>
                            </ComposedChart>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            {'Frames queue for each filter'}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default VideoRunner;