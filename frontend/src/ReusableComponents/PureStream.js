import * as React from 'react';

class PureStream extends React.Component {
    render() {
        return (
            <div className='camera' style={{
                width: 640,
                border: '1px solid #e9e9e9',
                height: 480,
                margin: '0 auto',
                position: 'relative',
                background: this.props.url ? this.props.url : '#e9e9e9'
            }}>
                {this.props.children}
            </div>
        )
    }
}

export default PureStream;
