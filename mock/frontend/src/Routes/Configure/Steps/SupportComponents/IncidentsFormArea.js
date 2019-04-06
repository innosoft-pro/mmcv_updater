import {Form, Select} from 'antd';
import * as React from 'react';
import {inject, observer} from 'mobx-react';

const FormItem = Form.Item;

@Form.create()
@inject('config')
@observer
export default class IncidentsFormArea extends React.Component {
    componentDidMount() {
        const active_areas = Array.from(this.props.config.config.markup_config.active_areas);
        const {setFieldsValue} = this.props.form;
        if (active_areas.length > 0)
            setFieldsValue({
                area: active_areas[0].line.line_name,
                classes: Array.from(active_areas[0].classes),
                reasons: Array.from(active_areas[0].reasons)
            });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const active_areas = Array.from(nextProps.config.config.markup_config.active_areas);
        const {getFieldValue, setFieldsValue} = nextProps.form;
        const areaLineName = getFieldValue('area');

        if (active_areas.length > 0) {
            const areaIndex = areaLineName === undefined ? -1 : active_areas.findIndex((area) => area.line.line_name === areaLineName);
            if (areaIndex === -1) {
                setFieldsValue({
                    area: active_areas[0].line.line_name,
                    classes: Array.from(active_areas[0].classes),
                    reasons: Array.from(active_areas[0].reasons)
                });
            }
        } else if (active_areas.length === 0 && areaLineName !== undefined) {
            setFieldsValue({area: undefined, classes: undefined, reasons: undefined});
        }
    }

    render() {
        const {getFieldDecorator, getFieldValue, setFieldsValue} = this.props.form;
        const active_areas = Array.from(this.props.config.config.markup_config.active_areas);
        const line_name = getFieldValue('area');
        const selectedArea = active_areas.find((area) => area.line.line_name === line_name);
        return (
            <Form layout='horizontal'>
                <FormItem label='Область распознавания'>
                    {getFieldDecorator('area')(
                        <Select onChange={(line_name) => {
                            const area = active_areas.find((area) => area.line.line_name === line_name);
                            setFieldsValue({
                                classes: Array.from(area.classes),
                                reasons: Array.from(area.reasons)
                            })
                        }}
                                notFoundContent='Нарисуйте области поверх видеопотока'>
                            {active_areas.map((area) =>
                                <Select.Option key={area.line.line_name}>{area.line.line_name}</Select.Option>
                            )}
                        </Select>
                    )}
                </FormItem>
                <FormItem label="Классы">
                    {getFieldDecorator('classes', {
                        rules: [{required: true, message: 'Список классов не может быть пустым'}]
                    })(
                        <Select disabled={selectedArea === undefined} mode="multiple"
                                placeholder="Выберите классы объектов для распознавания"
                                onChange={(classes) => selectedArea.classes = classes}>
                            <Select.Option value="person">Человек</Select.Option>
                            <Select.Option value="car">Автомобиль</Select.Option>
                            <Select.Option value="truck">Грузовик</Select.Option>
                            <Select.Option value="bus">Автобус</Select.Option>
                            <Select.Option value="unclassified">Неклассифицирован</Select.Option>
                        </Select>
                    )}
                </FormItem>
                <FormItem label="Причины">
                    {getFieldDecorator('reasons', {
                        rules: [{required: true, message: 'Список ситуаций не может быть пустым'}]
                    })(
                        <Select disabled={selectedArea === undefined} mode="multiple"
                                placeholder="Выберите типы ситуаций для распознавания"
                                onChange={(reasons) => selectedArea.reasons = reasons}>
                            <Select.Option value="stopped">Остановлен</Select.Option>
                            <Select.Option value="long_living">Долгоживущий</Select.Option>
                        </Select>
                    )}
                </FormItem>
            </Form>
        )
    }
}