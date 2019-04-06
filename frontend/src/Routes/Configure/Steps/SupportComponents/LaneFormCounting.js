import {Button, Form, InputNumber, Select} from 'antd';
import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {isPositive} from './../../../../utils'

const FormItem = Form.Item;

@Form.create()
@inject('config')
@observer
export default class LaneFormCounting extends React.Component {
    forceConfirm(field) {
        return (rule, value, callback) => {
            if (this.props.form.getFieldValue(field)) {
                this.props.form.validateFields([field], {force: true});
            }
            callback();
        };
    }

    laneValidation() {
        // unfortunately, it doesn't support multiple validators so far
        return (rule, value, callback) => {
            if (value) {
                if (!isPositive(value)) {
                    // that's why we first check lineNumber value itself
                    callback('Номер полосы должен быть целочисленным');
                } else {
                    // and then we check lane as a whole
                    this.checkLaneAlreadyExist(rule, value, callback);
                }
            } else {
                callback();
            }
        }
    }

    checkLaneAlreadyExist(rule, value, callback) {
        let lineDirection = this.props.form.getFieldValue('lineDirection');
        let lineNumber = value;
        let {lanes} = this.props.config.config.markup_config;
        if (lineDirection && lineNumber && lanes.length > 0) {
            let index = lanes.findIndex(
                lane => lane.direction === lineDirection && lane.number === lineNumber
            );
            if (index !== -1) {
                callback('Такая полоса уже существует');
            } else {
                callback();
            }
        } else {
            callback();
        }
    }

    render() {
        let {getFieldDecorator} = this.props.form;
        let {support_lines} = this.props.config.config.markup_config;
        return (
            <Form
                layout={'horizontal'}
                onSubmit={(e) => {
                    e.preventDefault();
                    this.props.form.validateFields((err, values) => {
                        console.log(err);
                        if (!err) {
                            this.props.saveLane(values);
                            this.props.form.resetFields();
                        }
                    });
                }}>
                <FormItem label='Направление полосы'>
                    {getFieldDecorator('lineDirection', {
                        rules: [{
                            required: true,
                            message: 'Укажите направление полосы'
                        }, {
                            validator: this.forceConfirm('lineNumber')
                        }],
                        initialValue: 'forward'
                    })
                    (<Select>
                        <Select.Option value='forward'>Вперед</Select.Option>
                        <Select.Option value='backward'>Назад</Select.Option>
                    </Select>)}
                </FormItem>
                <FormItem label='Номер полосы'>
                    {getFieldDecorator('lineNumber', {
                        rules: [{
                            required: true,
                            message: 'Укажите номер полосы'
                        }, {
                            validator: this.laneValidation(),
                        }],
                        initialValue: 1
                    })(
                        <InputNumber className='full_width'/>
                    )}
                </FormItem>
                <FormItem label='Линия подсчета ТС на полосе'>
                    {getFieldDecorator('countingLineName', {
                        rules: [{
                            required: true,
                            message: 'Укажите линию подсчёта машин'
                        }],
                    })(
                        <Select notFoundContent='Нарисуйте линии поверх видеопотока'>
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
                <Button className='full_width' type='primary' htmlType='submit'>Добавить размеченную полосу</Button>
            </Form>
        )
    }
}