import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Form, InputNumber} from 'antd';
import {checkIsPositiveValidator} from './../../../utils'

const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};

@Form.create()
@inject('routing', 'config', 'logsStore')
@observer
export class BaseConfigStep extends React.Component {
    render() {
        const {getFieldDecorator} = this.props.form;
        const {config} = this.props.config;
        return (
            <Form onSubmit={(e) => {
                e.preventDefault();
            }}>
                <FormItem label='Интервал между подсчётами (секунды)' {...formItemLayout}>
                    {getFieldDecorator('interval', {
                        rules: [{required: true},
                            {
                                validator: checkIsPositiveValidator,
                                message: 'Интервал должен быть положительным и целочисленным'
                            },
                            {
                                validator: (rule, value, callback) => 86400 % value === 0 ? callback() : callback(rule.message),
                                message: 'Интервал должен быть делителем числа 86400'
                            }],
                        initialValue: config.base_config.interval,
                        validateFirst: true
                    })(
                        <InputNumber className='full_width' onChange={(number) => config.base_config.interval = number}
                                     size='large'/>
                    )}
                </FormItem>
                <FormItem label='Id камеры' {...formItemLayout}>
                    {getFieldDecorator('cameraId', {
                        rules: [{
                            required: true,
                        }, {
                            validator: checkIsPositiveValidator,
                            message: 'Id камеры должен быть положительным и целочисленным'
                        }],
                        initialValue: config.base_config.camera_id,
                        validateFirst: true
                    })(
                        <InputNumber className='full_width' onChange={(number) => config.base_config.camera_id = number}
                                     size='large'/>
                    )}
                </FormItem>
            </Form>
        )
    }
}

export default BaseConfigStep;
