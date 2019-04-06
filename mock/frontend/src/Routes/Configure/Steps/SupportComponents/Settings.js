import * as React from 'react';
import {observer} from 'mobx-react';
import {Col, Row} from 'antd';
import {Canvas, Circle, Image, Path, Text} from 'react-fabricjs';

import HighlightingSwitch from './HighlightingSwitch';

@observer
export class Settings extends React.Component {

    render() {
        return (
            <Row gutter={8}>
                <Col span={16}> Подсветка линий включена </Col>
                <Col>
                    <HighlightingSwitch/>
                </Col>
            </Row>
        );
    }
}
