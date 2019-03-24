import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Col, Row, Tabs} from 'antd';
import {Canvas, Circle, Image, Path, Text} from 'react-fabricjs';

import LaneFormSpeedByDirection from './SupportComponents/LaneFormSpeedByDirection';
import LineDrawer from './SupportComponents/LineDrawer';
import {Settings} from "./SupportComponents/Settings";

const TabPane = Tabs.TabPane;

@inject('config')
@observer
export class SpeedMarkupStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            laneFormTabKey: '1'
        }
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
                    xs={{span: 1, offset: 1}}>

                </Col>
                <Col className='card-container'
                     lg={{span: 8}}
                     md={{span: 8}}
                     xs={{span: 24}}>
                    <Tabs
                        className='margin_top_10'
                        defaultActiveKey='1'
                        tabPosition='left'
                    >
                        <TabPane tab='Вперёд' key='1'>
                            <LaneFormSpeedByDirection direction='forward'/>
                        </TabPane>
                        <TabPane tab='Назад' key='2'>
                            <LaneFormSpeedByDirection direction='backward'/>
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

export default SpeedMarkupStep;
