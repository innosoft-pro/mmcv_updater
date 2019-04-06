import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import JSONPretty from 'react-json-pretty';
import Lightbox from 'react-image-lightbox';
import {Button, Collapse, Modal, notification, Popconfirm, Steps, Tooltip} from 'antd';

import ConnectionStep from './Steps/ConnectionStep';
import BaseConfigStep from './Steps/BaseConfigStep';
import MarkupStep from './Steps/MarkupStep';
import SpeedMarkupStep from './Steps/SpeedMarkupStep';
import IncidentsMarkupStep from './Steps/IncidentsMarkupStep';

const Step = Steps.Step;

@inject('config', 'logsStore', 'routing')
@observer
class FullConfiguration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            isLightbox: false
        };
    }

    next() {
        const current = this.state.current + 1;
        this.setState({current});
        window.scrollTo(0, 0);
    }

    prev() {
        const current = this.state.current - 1;
        this.setState({current});
        window.scrollTo(0, 0);
    }

    dropConfig() {
        this.props.config.dropConfigurationToDefault();
        this.setState({current: 0});
        notification['success']({
            message: 'Конфигурация успешно сброшена.',
            description: 'Тем не менее, она не была удалена (как и строка подключения). Перезагрузите страницу чтобы вернуть всё обратно.'
        });
    }

    render() {
        const {current} = this.state;
        let showJs = toJS(this.props.config.finalConfig);
        window.scrollTo(0, 0);
        // Refactor ConfigSteps
        let url = this.props.logsStore.cameraState.status ?
            `url(/configurator/videoFeed)` : null;
        let ConfigSteps = [{
            title: 'Интервал и cameraId',
            content: <BaseConfigStep/>,
            instruction: 'Здесь интервал - количество секунд между снятием показаний. ' +
                'По умолчанию равен 300 (5 минутам, ровно как на ПУИДах). ' +
                'Для ровного подсчёта должен быть делителем числа 86400. ' +
                'Id камеры должно быть взято из БД Минимакс.',
            examplePicture: null
        }, {
            title: 'Строка подключения',
            content: <ConnectionStep url={url}/>,
            instruction: 'В данный момент вам нужно задать строку подключения к камере, ' +
                'нажать кнопку "Установить строку подключения" и затем убедиться, что видеопоток с камеры появился. ' +
                'Если система уведомила, что видеопоток подключён, но он не показан - попробуйте обновить страницу.',
            examplePicture: null
        }];
        if (this.props.logsStore.systemType.status === 'core') ConfigSteps = ConfigSteps.concat([{
            title: 'Линии подсчёта',
            content: <MarkupStep url={url}/>,
            instruction: 'Здесь необходимо нарисовать линии подсчёта машин для каждой полосы. ' +
                'Направления должны совпадать с направлениями при настройке ПУИДа. ' +
                'Если направления неизвестны - то "Вперёд" - это направление движения машин от камеры, а "Назад" - к камере. ' +
                'Номер полосы считается c 1 от правого края дороги относительно направления движения. ' +
                'Машина объявляется посчитанной в тот момент, когда её центр пересекает линию подсчёта. ' +
                'Следовательно, линиям нужно быть ВЫШЕ дорожного полотна и желательно ШИРЕ чем сама полоса. ' +
                'Ну и, разумеется, быть перпендикулярными направлению движения центров машин.',
            examplePicture: require('../../../images/counting_example.png')
        }, {
            title: 'Линии скоростей',
            content: <SpeedMarkupStep url={url}/>,
            instruction: 'Здесь необходимо задать НОВЫЕ линии для подсчёта скорости. ' +
                'Эти линии должны быть заданы целиком на оба направления (см. вкладку "Назад"). ' +
                'Дистанция измеряется в метрах, лучший способ подсчитать её - попросить другого инженера встать под камеру и измерить. ' +
                'Если такой роскоши нет - можно замерять по барьерке (одно деление ~2 метра). ' +
                'Максимальная рекомендуемая дистанция замера - 20-30 метров, расположенных приблизительно в середине кадра. ' +
                'Линии скорости, как и линии подсчёта, должны располагаться так, чтобы через них проходил центр любой машины на направлении.',
            examplePicture: require('../../../images/speed_example.png')
        }]);
        if (this.props.logsStore.systemType.status === 'incidents') ConfigSteps = ConfigSteps.concat([{
            title: 'Область распознавания',
            content: <IncidentsMarkupStep url={url}/>,
            instruction: 'Нарисуйте области в которых необходимо распознавать инциденты. ' +
                'Нажмите "Enter" чтобы завершить рисование области. Настройте требуемые классы объектов и ситуации для распознавания в панели справа. ' +
                'Используейте клавиши "Backspace" для удаления последней нарисованной точки и "Escape" для отмены рисования.',
            examplePicture: require('../../../images/incidents_area_example.png')
        }]);

        return (
            <div>
                <Modal
                    title={'Конфигурирование недоступно'}
                    visible={this.props.logsStore.pipelineState.status === 'working'}
                    closable={false}
                    footer={
                        <Button type='primary' onClick={(e) => {
                            this.props.routing.push('/');
                        }}>
                            На главную
                        </Button>
                    }>
                    Система уже запущена. Остановите систему, затем продолжите конфигурирование.
                </Modal>
                <Steps current={current}>
                    {ConfigSteps.map(item => <Step key={item.title} title={item.title}/>)}
                </Steps>
                <div className='steps-content'>{ConfigSteps[this.state.current].content}</div>
                <div className='steps-action'>
                    {
                        this.state.current < ConfigSteps.length - 1
                        &&
                        <Button type='primary' onClick={() => this.next()}>Следующий шаг</Button>
                    }
                    {
                        this.state.current === ConfigSteps.length - 1
                        &&
                        <Button type='primary' onClick={() => {
                            this.props.config.saveConfig()
                                .then((response) => {
                                    if (response.data.success) {
                                        notification['success']({
                                            message: 'Система успешно сконфигурирована'
                                        });
                                        this.props.routing.push('/');
                                    } else {
                                        notification['error']({
                                            message: 'Ошибка при сохранении',
                                            description: response.data.message
                                        });
                                    }
                                })
                                .catch((e) => {
                                    notification['error']({
                                        message: 'Неизвестная ошибка!'
                                    });
                                });
                        }}>Сохранить и перейти к запуску системы</Button>
                    }
                    {
                        this.state.current > 0
                        &&
                        <Button style={{marginLeft: 12}} onClick={() => this.prev()}>
                            Назад
                        </Button>
                    }

                    <Tooltip title={ConfigSteps[this.state.current].instruction} placement='topRight'>
                        <Button style={{marginLeft: 12}} type='primary' ghost>
                            Инструкция
                        </Button>
                    </Tooltip>
                    {
                        ConfigSteps[this.state.current].examplePicture
                        &&
                        <Button style={{marginLeft: 12}} type='dashed'
                                onClick={() => this.setState({isLightbox: true})}>
                            Пример
                        </Button>
                    }
                    {
                        this.state.isLightbox
                        &&
                        <Lightbox
                            mainSrc={ConfigSteps[this.state.current].examplePicture}
                            onCloseRequest={() => this.setState({isLightbox: false})}
                        />
                    }

                    <Popconfirm title="Точно хотите сбросить текущую конфигурацию?"
                                okText="Да"
                                cancelText="Нет"
                                onConfirm={() => this.dropConfig()}
                                placement="topRight">
                        <Button className='float_right' type='danger'>
                            Сбросить текущую конфигурацию и вернуться в начало
                        </Button>
                    </Popconfirm>
                </div>
                <div className='margin_top_40'>
                    <Collapse className='full_width' accordion>
                        <Collapse.Panel header={'Показать текущую конфигурацию'} key={'currConfig'}>
                            <JSONPretty json={showJs}/>
                        </Collapse.Panel>
                    </Collapse>
                </div>
            </div>
        );
    }
}

export default FullConfiguration;