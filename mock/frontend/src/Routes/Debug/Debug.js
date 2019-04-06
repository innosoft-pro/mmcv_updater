import * as React from 'react';
import {Button, Col, Row} from 'antd';
import {inject, observer} from 'mobx-react';
import {Bar, CartesianGrid, ComposedChart, Legend, Tooltip, XAxis, YAxis} from 'recharts';

import PureStream from '../../ReusableComponents/PureStream';

@inject('logsStore', 'routing', 'debugStore')
@observer
class DebugView extends React.Component {
    render() {
        let data = Array.from(this.props.debugStore.cameraFilters);

        return (
            <div>
                <Row className='margin_top_10'>
                    <Col span={12}>
                        <PureStream
                            url={this.props.logsStore.cameraState.status ? `url(/configurator/videoFeed)` : null}/>
                    </Col>
                    <Col span={12}>
                        <PureStream
                            url={this.props.logsStore.cameraState.status ? `url(/configurator/videoBGSFeed` : null}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <PureStream
                            url={this.props.logsStore.pipelineState.status === 'working' ? `url(/configurator/tf)` : null}/>
                    </Col>
                    <Col span={12}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <ComposedChart layout="vertical" width={600} height={500} data={data}
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
                <Button style={{marginLeft: 12}} onClick={(e) => {
                    this.props.routing.push('/');
                }}>Назад
                </Button>
            </div>

        )
    }
}

export default DebugView;
