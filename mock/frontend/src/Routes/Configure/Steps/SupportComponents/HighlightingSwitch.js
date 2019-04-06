import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Switch} from 'antd';


@inject('config')
@observer
export default class HighlightingSwitch extends React.Component {
    switchStyle = {
        'textAlign': 'center',
    };

    render() {
        return (
            <Switch style={this.switchStyle}
                    checkedChildren={'Да'}
                    unCheckedChildren={'Нет'}
                    defaultChecked={this.props.config.lineNameVisible}
                    onChange={(checked) => {
                        this.props.config.lineNameVisible = checked;
                    }}
            />
        );
    }
}
