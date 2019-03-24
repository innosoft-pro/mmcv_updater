import {Form, InputNumber, Select} from 'antd';
import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {checkIsPositiveValidator} from './../../../../utils'

const FormItem = Form.Item;

@Form.create()
@inject('config')
@observer
export default class LaneFormSpeedByDirection extends React.Component {
    forceConfirm(field) {
        return (rule, value, callback) => {
            if (this.props.form.getFieldValue(field)) {
                this.props.form.validateFields([field], {force: true});
            }
            callback();
        };
    }

    shouldNotMatchWith(field) {
        return (rule, value, callback) => {
            if (value === this.props.form.getFieldValue(field)) {
                callback(rule.message);
            } else {
                callback();
            }
        };
    }

    render() {
        let {getFieldDecorator} = this.props.form;
        let {support_lines} = this.props.config.config.markup_config;
        let directionState = this.props.config.config.speed_lines[this.props.direction];
        return (
            <Form
                layout={'horizontal'}
                onSubmit={(e) => {
                    e.preventDefault();
                }}>
                <FormItem label='Ближняя линия фиксации скорости'>
                    {getFieldDecorator('speedLineName1', {
                        rules: [{
                            required: true,
                            message: 'Укажите ближнюю линию фиксации скорости'
                        }, {
                            validator: this.forceConfirm('speedLineName2')
                        }],
                        initialValue: directionState.line1_name
                    })(
                        <Select notFoundContent='Нарисуйте линии поверх видеопотока' onChange={
                            (value) => {
                                directionState.line1_name = value;
                            }
                        }>
                            {
                                support_lines.map((line) => {
                                    return (
                                        <Select.Option key={line.line_name}>{line.line_name}</Select.Option>
                                    );
                                })
                            }
                        </Select>
                    )}
                </FormItem>
                <FormItem label='Дальняя линия фиксации скорости'>
                    {getFieldDecorator('speedLineName2', {
                        rules: [{
                            required: true,
                            message: 'Укажите дальнюю линию подсчёта'
                        }, {
                            validator: this.shouldNotMatchWith('speedLineName1'),
                            message: 'Не должно совпадать с ближней линией'
                        }],
                        initialValue: directionState.line2_name
                    })(
                        <Select notFoundContent='Нарисуйте линии поверх видеопотока' onChange={
                            (value) => {
                                directionState.line2_name = value;
                            }
                        }>
                            {
                                support_lines.map((line) => {
                                    return (
                                        <Select.Option key={line.line_name}>{line.line_name}</Select.Option>
                                    );
                                })
                            }
                        </Select>
                    )}
                </FormItem>
                <FormItem label='Дистанция между линиями (в метрах)'>
                    {getFieldDecorator('speedLinesDistance', {
                        rules: [{
                            required: true,
                            message: 'Укажите дистанцию между ближней и дальней линией'
                        }, {
                            validator: checkIsPositiveValidator,
                            message: 'Дистанция должна быть положительной и целочисленной'
                        }],
                        initialValue: directionState.distance
                    })(
                        <InputNumber className='full_width'
                                     onChange={(number) => directionState.distance = parseInt(number)}/>
                    )}
                </FormItem>
            </Form>
        )
    }
}