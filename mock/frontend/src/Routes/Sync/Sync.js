import * as React from "react";
import {Alert, Button, Col, DatePicker, Input, notification, Row, Select, Spin, TimePicker} from "antd";
import {inject, observer} from "mobx-react";
import axios from "axios";

const Option = Select.Option;

@inject('routing', 'syncStore')
@observer
class Sync extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: false
        };
        props.syncStore.start()
    }

    componentWillUnmount() {
        this.props.syncStore.stop();
    }

    syncTime() {
        const syncStore = this.props.syncStore;
        const data = {
            "NTP": syncStore.NTP,
            "TZ": syncStore.TZ,
            "date": syncStore.date != null ? syncStore.date.format("DD.MM.YYYY") : null,
            "time": syncStore.time != null ? syncStore.time.format("HH:mm:ss") : null
        };
        this.state.fetching = true;
        axios.post('/configurator/syncDateTime', data).then(
            (response) => {
                if (response.data) {
                    let resp = response.data;
                    if (resp.result === true) {
                        notification['success']({
                            message: 'Время синхронизировано',
                        });
                        if (syncStore.NTP) {
                            syncStore.defaultNTP = syncStore.NTP;
                        }
                        syncStore.defaultTZ = syncStore.TZ;
                    } else {
                        notification['error']({
                            message: 'Ошибка при синхронизации времени',
                            description: resp.message
                        });
                    }
                }
                this.state.fetching = false;
            }
        ).catch((error) => {
            let e = {...error};
            if (e.response.data) {
                let resp = e.response.data;
                if (resp.result === true) {
                    notification['success']({
                        message: 'Время синхронизировано',
                    });
                    if (syncStore.NTP) {
                        syncStore.defaultNTP = syncStore.NTP;
                    }
                    syncStore.defaultTZ = syncStore.TZ;
                } else {
                    notification['error']({
                        message: 'Ошибка при синхронизации времени',
                        description: resp.message
                    });
                }
            }
            this.state.fetching = false;
        });
        syncStore.date = null;
        syncStore.time = null;
        this.shouldResetTimeDate = true;
    }

    render() {
        const syncStore = this.props.syncStore;
        let resetTimeDate = this.shouldResetTimeDate ? {value: null} : {};
        this.shouldResetTimeDate = false;

        let ntpInput;
        if (syncStore.time != null || syncStore.date != null) {
            ntpInput = <Alert className="full_width"
                              style={{borderColor: "#d9d9d9"}}
                              message="При ручном вводе даты/времени, синхронизация с NTP невозможна."
                              type="warning" showIcon/>;
        } else {
            ntpInput = <Input className='full_width' placeholder={syncStore.defaultNTP}
                              onChange={(ev) => syncStore.NTP = ev.target.value}/>;
        }

        return (
            <div>
                <Row size="large">
                    <Col span={2} style={{padding: 7}}>
                        <span style={{float: 'right'}}>Дата и время:</span>
                    </Col>
                    <Col span={2}>
                        <DatePicker className='full_width' format="DD.MM.YYYY"
                                    placeholder={syncStore.currentDate}
                                    {...resetTimeDate}
                                    onChange={(ev) => syncStore.date = ev}
                                    disabled={syncStore.NTP !== ''}/>
                    </Col>
                    <Col span={2} style={{paddingLeft: 15}}>
                        <TimePicker className='full_width' placeholder={syncStore.currentTime}
                                    {...resetTimeDate} disabled={syncStore.NTP !== ''}
                                    onChange={(ev) => syncStore.time = ev}/>
                    </Col>
                </Row>
                <Row className='margin_top_10' size="large">
                    <Col span={2} style={{padding: 7}}>
                        <span style={{float: 'right'}}>Таймзона:</span>
                    </Col>
                    <Col span={4}>
                        <Select className='full_width' showSearch optionFilterProp="children"
                                value={syncStore.TZ} dropdownMatchSelectWidth={false}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                onChange={(ev) => syncStore.TZ = ev}>
                            {syncStore.timezonesList.map(tz =>
                                <Option key={tz[0]} value={tz[0]}>{tz[1] + " " + tz[0]}</Option>)}
                        </Select>
                    </Col>
                </Row>
                <Row className='margin_top_10' size="large">
                    <Col span={2} style={{padding: 7}}>
                        <span style={{float: 'right'}}>Адрес NTP:</span>
                    </Col>
                    <Col span={4}>
                        {ntpInput}
                    </Col>
                </Row>
                <Row className='margin_top_10' size="large">
                    <Col span={2}>
                        <Button style={{float: 'right', marginRight: 7}} onClick={(e) => {
                            this.props.routing.push('/');
                            syncStore.NTP = "";
                            syncStore.TZ = syncStore.defaultTZ;
                            syncStore.date = null;
                            syncStore.time = null;
                        }}>Назад</Button>
                    </Col>
                    <Col span={4}>
                        <Spin spinning={this.state.fetching} delay={500}>
                            <Button className="full_width" onClick={(e) => {
                                this.syncTime();
                            }}>
                                Синхронизировать
                            </Button>
                        </Spin>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Sync;
