import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Col, Form, Row, Tabs} from 'antd';

import LineDrawer from './SupportComponents/LineDrawer';
import {Settings} from "./SupportComponents/Settings";
import IncidentsFormArea from "./SupportComponents/IncidentsFormArea";

const TabPane = Tabs.TabPane;

@Form.create()
@inject('config')
@observer
export default class IncidentsMarkupStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {formTabKey: '1'}
    }

    render() {
        return (
            <Row>
                <Col lg={{span: 14}} md={{span: 14}} xs={{span: 20}}>
                    <LineDrawer url={this.props.url} polygonMode={true}/>
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

                    <Tabs className='margin_top_10' activeKey={this.state.formTabKey}
                          onChange={(activeKey) => this.setState({formTabKey: activeKey})}
                          tabPosition='left'
                    >
                        <TabPane tab='Настроить' key='1'>
                            <IncidentsFormArea/>
                        </TabPane>
                        <TabPane tab='Настройки' key='2'>
                            <Settings/>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        );
    }
}
