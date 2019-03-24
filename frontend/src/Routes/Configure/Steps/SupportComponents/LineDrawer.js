import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Form, message, Spin} from 'antd';
import keydown, {Keys} from 'react-keydown';

import LinePopover from './LinePopover';
import PureStream from './../../../../ReusableComponents/PureStream';

@Form.create()
@inject('routing', 'config', 'logsStore')
@observer
export default class LineDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {points: []};
        this.canvas = null;
    }

    @keydown(Keys.delete)
    deleteSelected() {
        this.props.config.deleteLine(this.props.config.selectedLine);
        this.props.config.selectedLine = '';
    }

    @keydown(Keys.esc)
    cancel() {
        if (this.props.config.selectedLine !== '')
            this.props.config.selectedLine = '';
        else if (this.state.points.length > 0) {
            this.setState({points: []});
            message.info('Рисование линии отменено.');
        }
    }

    @keydown(Keys.enter)
    finishDrawing() {
        this.props.config.selectedLine = '';
        const points = this.state.points;
        if (points.length > 2) {
            if (this.intersectsPreviousLines({p1: points[0], p2: points[points.length - 1]}))
                return message.error('Замыкающая линия пересекает предыдущие.');
            this.props.config.addLine([...this.state.points]);
            this.setState({points: []});
        }
    }

    @keydown(Keys.backspace)
    removeLastPoint() {
        this.props.config.selectedLine = '';
        if (this.state.points.length > 0) {
            this.setState({points: [...this.state.points.slice(0, -1)]});
            message.info('Последняя точка удалена.');
        }
    }

    intersectsPreviousLines(newLine) {
        let prevPoint = this.state.points[0];
        for (let point of this.state.points.slice(1)) {
            if (LineDrawer.linesIntersect(newLine, {p1: prevPoint, p2: point}))
                return true;
            prevPoint = point;
        }
        return false
    }

    static linesIntersect(l1, l2) {
        const det = (l1.p2.x - l1.p1.x) * (l2.p2.y - l2.p1.y) - (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y);
        if (det === 0) {
            return false;
        } else {
            const lambda = ((l2.p2.y - l2.p1.y) * (l2.p2.x - l1.p1.x) + (l2.p1.x - l2.p2.x) * (l2.p2.y - l1.p1.y)) / det;
            const gamma = ((l1.p1.y - l1.p2.y) * (l2.p2.x - l1.p1.x) + (l1.p2.x - l1.p1.x) * (l2.p2.y - l1.p1.y)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    }

    static buildPointsArray(pixels) {
        let points = '';
        for (let pixel of pixels) {
            points += pixel.x + ',' + pixel.y + ' ';
        }
        return points;
    }

    handleSVGClick(e) {
        if (this.canvas === null)
            this.canvas = e.target;
        this.props.config.selectedLine = '';
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.ceil(e.clientX - rect.left);
        const y = Math.ceil(e.clientY - rect.top);

        const points = [...this.state.points, {x, y}];
        if (this.state.points.length > 0) {
            const prevPoint = this.state.points[this.state.points.length - 1];
            const d = Math.abs(x - prevPoint.x) + Math.abs(y - prevPoint.y);
            if (d < 10)
                return message.error('Слишком короткая линия.');
            if (this.props.polygonMode === true) {
                if (this.state.points.length > 1) {
                    if (this.intersectsPreviousLines({p1: prevPoint, p2: {x, y}}))
                        return message.error('Линия пересекает предыдущие.')
                }
            } else {
                this.props.config.addLine(points);
                return this.setState({points: []});
            }
        }
        this.setState({points: points});
    }

    render() {
        return (
            <PureStream url={this.props.url}>
                <Spin tip='загрузка' spinning={this.props.config.loading}>
                    <svg style={{width: '100%', height: 480,}} onClick={(e) => this.handleSVGClick(e)}>
                        {(this.props.polygonMode === true ? this.props.config.getAreaLines() : this.props.config.getLines()).map((line) =>
                            <LinePopover key={'popover:' + line.line_name} line={line}/>
                        )}
                        {(this.state.points.length > 1) ?
                            <polyline fill='none' stroke='#FF32FF' strokeWidth={7} strokeDasharray='10,5'
                                      points={LineDrawer.buildPointsArray(this.state.points)}/> : null
                        }
                        {this.state.points.map((point, index) =>
                            <circle key={'point-' + index} cx={point.x} cy={point.y} r={4} fill='#803280'/>
                        )}
                    </svg>
                </Spin>
            </PureStream>
        );
    }
}
