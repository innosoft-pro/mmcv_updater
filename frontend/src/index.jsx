import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'mobx-react';
import {RouterStore, syncHistoryWithStore} from 'mobx-react-router';
import {hashHistory, Route, Router} from 'react-router';
import {Home} from './Routes/Home/Home';
import LogsStore from './Stores/LogsStore';
import ConfigStore from './Stores/ConfigStore';
import VideoStore from './Stores/VideoStore';
import DebugStore from './Stores/DebugStore';
import SyncStore from './Stores/SyncStore';
import FullConfiguration from './Routes/Configure/FullConfiguration';
import VideoConfiguration from './Routes/Configure/VideoConfiguration';
import VideoRunner from './Routes/Video/VideoRunner';
import DebugView from './Routes/Debug/Debug';
import SyncView from './Routes/Sync/Sync';
import {LocaleProvider} from 'antd';
import ru_RU from 'antd/lib/locale-provider/ru_RU';

require('../css/antd.css');
require('../css/project.css');

const routingStore = new RouterStore();
const logsStore = new LogsStore();
const configStore = new ConfigStore();
const videoStore = new VideoStore();
const debugStore = new DebugStore();
const syncStore = new SyncStore();

configStore.fetchCurrentConfig();
videoStore.updateVideoList();
const stores = {
    routing: routingStore,
    logsStore: logsStore,
    config: configStore,
    videoStore: videoStore,
    debugStore: debugStore,
    syncStore: syncStore
};

const history = syncHistoryWithStore(hashHistory, routingStore);

render(
    <LocaleProvider locale={ru_RU}>
        <Provider {...stores}>
            <Router history={history}>
                <Route path='/' component={Home}/>
                <Route path='/config' component={FullConfiguration}/>
                <Route path='/video' component={VideoRunner}/>
                <Route path='/videoConfig' component={VideoConfiguration}/>
                <Route path='/debug' component={DebugView}/>
                <Route path='/sync' component={SyncView}/>
            </Router>
        </Provider>
    </LocaleProvider>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./Routes/Home/Home', () => {
        const NextApp = require('./Routes/Home/Home').default;
        const NextCfg = require('./Routes/Configure/FullConfiguration').default;
        const NextVid = require('./Routes/Configure/VideoRunner').default;
        const NextVidCfg = require('./Routes/Configure/VideoConfiguration').default;
        const NextDbg = require('./Routes/Debug/Debug').default;
        const NextSnc = require('./Routes/Sync/Sync').default;

        render(
            <LocaleProvider locale={ru_RU}>
                <Provider {...stores}>
                    <Router history={history}>
                        <Route path='/' component={NextApp}/>
                        <Route path='/config' component={NextCfg}/>
                        <Route path='/video' component={NextVid}/>
                        <Route path='/videoConfig' component={NextVidCfg}/>
                        <Route path='/debug' component={NextDbg}/>
                        <Route path='/sync' component={NextSnc}/>
                    </Router>
                </Provider>
            </LocaleProvider>,

            document.getElementById('root')
        );
    });
}
