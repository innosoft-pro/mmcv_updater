import * as React from 'react';
import axios from 'axios';
import {inject, observer} from 'mobx-react';
import {Button, Col, Form, Icon, Input, Modal, notification, Row, Spin} from 'antd';

import PureStream from './../../../ReusableComponents/PureStream';

@Form.create()
@inject('config')
@observer
export class ConnectionStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connectionString: '',
            fetching: false
        }
    }

    setCameraConnectionString(values) {
        this.setState({fetching: true});
        axios.post('/configurator/setConnectionString', {
            'connection_string': values.connectionString
        }).then((response) => {
            this.setState({fetching: false});
            if (response.data) {
                let resp = response.data;
                if (resp.result === true) {
                    notification['success']({
                        message: 'Строка подключения установлена'
                    });
                    this.props.config.currentConnectionString = values.connectionString;
                } else {
                    notification['error']({
                        message: 'Ошибка',
                        description: resp.message
                    });
                }
            }
        }).catch((error) => {
            this.setState({fetching: false});
            let e = {...error};
            if (e.response.data) {
                let resp = e.response.data;
                if (resp.result === true) {
                    notification['success']({
                        message: 'Строка подключения установлена'
                    });
                } else {
                    notification['error']({
                        message: 'Ошибка',
                        description: resp.message
                    });
                }
            }
        })
    }

    render() {
        let {getFieldDecorator} = this.props.form;
        return (
            <Spin spinning={this.state.fetching} size='large'>
                <div>
                    <Row>
                        <Col span={24}>
                            <Form layout={'inline'} onSubmit={(e) => {
                                e.preventDefault();
                                this.props.form.validateFields((err, values) => {
                                    if (!err) {
                                        if (this.props.config.currentConnectionString) {
                                            Modal.confirm({
                                                title: 'Осторожно, вы перезаписываете существующую строку подключения!',
                                                content: 'Конфигурация разметки будет сброшена.',
                                                onOk: () => {
                                                    this.props.config.dropMarkupToDefault();
                                                    this.setCameraConnectionString(values);
                                                },
                                                onCancel() {
                                                },
                                                okText: 'Ок',
                                                cancelText: 'Отмена'
                                            });
                                        } else {
                                            this.setCameraConnectionString(values);
                                        }
                                    }
                                });
                            }}>
                                <Row gutter={16}>
                                    <Col span={16}>
                                        {getFieldDecorator('connectionString', {
                                            rules: [{
                                                required: true,
                                                message: 'Пожалуйста, введите строку подключения!',
                                            }],
                                            initialValue: this.props.config.currentConnectionString
                                        })(
                                            <Input className='full_width'
                                                   placeholder='Введите строку подключения к камере'
                                                   size='large'/>
                                        )}
                                    </Col>
                                    <Col span={8}>
                                        <Button className='full_width' size='large' htmlType='submit' type='primary'>
                                            Установить строку подключения <Icon type='video-camera'/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                    <Row className='margin_top_10'>
                        <Col span={24}>
                            <PureStream url={this.props.url}/>
                        </Col>
                    </Row>
                </div>
            </Spin>
        )
    }
}

export default ConnectionStep;