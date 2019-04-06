import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Col, Form, notification, Row, Tabs} from 'antd';
import {Canvas, Circle, Image, Path, Text} from 'react-fabricjs';

import LineDrawer from './SupportComponents/LineDrawer';
import LaneFormCounting from './SupportComponents/LaneFormCounting';
import LaneDelete from './SupportComponents/LaneDelete';
import {Settings} from "./SupportComponents/Settings";

const TabPane = Tabs.TabPane;

@Form.create()
@inject('config')
@observer
export default class MarkupStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            laneFormTabKey: '1'
        }
    }

    saveLane(values) {
        let newLane = {
            direction: values.lineDirection,
            number: values.lineNumber,
            counting_line_name: values.countingLineName
        };
        this.props.config.config.markup_config.lanes.push(newLane);
        notification['success']({
            message: 'Полоса успешно добавлена!',
            description: 'Конфигурацию можно посмотреть внизу страницы.'
        });
    }

    dropTabToDefault() {
        this.setState({
            laneFormTabKey: '1'
        });
    }

    render() {
        return (
            <Row>
                <Col lg={{span: 14}} md={{span: 14}} xs={{span: 20}}>
                    <LineDrawer url={this.props.url}/>
                </Col>
                <Col
                    lg={{span: 1, offset: 1}}
                    md={{span: 1, offset: 1}}
                    xs={{span: 1, offset: 1}}
                >
                </Col>
                <Col className='card-container'
                     lg={{span: 8}}
                     md={{span: 8}}
                     xs={{span: 24}}>

                    <Tabs className='margin_top_10' activeKey={this.state.laneFormTabKey}
                          onChange={(activeKey) => {
                              this.setState({laneFormTabKey: activeKey});
                          }}
                          tabPosition='left'
                    >
                        <TabPane tab='Добавить' key='1'>
                            <LaneFormCounting saveLane={(values) => this.saveLane(values)}/>
                        </TabPane>
                        <TabPane tab='Просмотреть' key='2'
                                 disabled={this.props.config.config.markup_config.lanes.length === 0}>
                            <LaneDelete dropTabToDefault={() => this.dropTabToDefault()}/>
                        </TabPane>
                        <TabPane tab='Настройки' key='3'>
                            <Settings/>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        );
    }
}
