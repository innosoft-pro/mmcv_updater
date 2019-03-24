import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Button, Popover, Tooltip} from 'antd';

@inject('config')
@observer
export default class LinePopover extends React.Component {
    constructor(props) {
        super(props);
        this.points = '';
        this.cx = 0;
        this.cy = 0;
        for (let pixel of props.line.pixels) {
            this.cx += pixel.x;
            this.cy += pixel.y;
            this.points += `${pixel.x},${pixel.y} `;
        }
        this.cx = Math.ceil(this.cx / props.line.pixels.length);
        this.cy = Math.ceil(this.cy / props.line.pixels.length);
    }

    render() {
        const line_name = this.props.line.line_name;
        const isSelected = this.props.config.selectedLine === line_name;
        const showTooltip = this.props.config.lineNameVisible && !isSelected;
        const lineProps = {
            points: this.points, strokeWidth: '7', style: {cursor: 'pointer'},
            fill: "none", stroke: isSelected ? '#803280' : '#FF32FF',
            onClick: (e) => {
                e.stopPropagation();
                this.props.config.selectedLine = isSelected ? '' : line_name;
            }
        };

        return (
            <g>
                <Popover key={line_name}
                         title={line_name}
                         content={
                             <Button
                                 className='full_width'
                                 type='danger'
                                 onClick={() => this.props.config.deleteLine(line_name)}
                             >
                                 Удалить эту линию
                             </Button>
                         }
                         visible={isSelected}>
                    <Tooltip title={<p style={{cursor: 'pointer'}} onClick={() => this.props.config.selectedLine = line_name}>{line_name}</p>}
                             visible={showTooltip}>
                        <circle cx={this.cx} cy={this.cy} r={1} fill='none' stroke='black'/>
                    </Tooltip>
                </Popover>
                {this.props.line.pixels.length > 2 ? <polygon {...lineProps}/> : <polyline {...lineProps}/>}
            </g>
        );
    }
}