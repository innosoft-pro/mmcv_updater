import {Button, Collapse} from 'antd';
import JSONPretty from 'react-json-pretty';
import * as React from 'react';
import {inject, observer} from 'mobx-react';
import * as mobx from 'mobx';
import {translateDirection} from './../../../../utils'

const Panel = Collapse.Panel;

@inject('config')
@observer
export default class LaneDelete extends React.Component {
    deleteLane(laneToDelete) {
        let {lanes} = this.props.config.config.markup_config;
        let index = lanes.findIndex(
            lane => lane.direction === laneToDelete.direction && lane.number === laneToDelete.number
        );
        if (index !== -1) {
            lanes.splice(index, 1);
        }
        if (lanes.length === 0) {
            this.props.dropTabToDefault();
        }
    }

    render() {
        let {lanes} = mobx.toJS(this.props.config.config.markup_config);
        return (
            <Collapse accordion>
                {lanes.map((lane) => {
                    let laneConfig = mobx.toJS(lane);
                    let laneHeader = `Направление: "${translateDirection([laneConfig.direction])}", номер: ${laneConfig.number}`;
                    return (
                        <Panel
                            header={laneHeader}
                            key={'laneKey:' + laneHeader}
                            className="full_width"
                        >
                            <JSONPretty json={laneConfig}/>
                            <br/>
                            <Button type='danger' className='full_width' onClick={(e) => {
                                this.deleteLane(laneConfig);
                            }}>Удалить полосу</Button>
                        </Panel>
                    )
                })}
            </Collapse>
        )
    }
}