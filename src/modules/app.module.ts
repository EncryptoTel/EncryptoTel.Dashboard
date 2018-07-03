import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {UserTokenInterceptor} from '../shared/request.interceptors';

import {MainViewComponent} from '../components/main-view.component';

import {MainRouterModule} from './router.module';
import {ComponentsModule} from './components.module';

import {LoggerServices} from '../services/logger.services';
import {LocalStorageServices} from '../services/local-storage.services';
import {RequestServices} from '../services/request.services';
import {MessageServices} from '../services/message.services';
import {AuthorizationServices} from '../services/authorization.services';
import {UserServices} from '../services/user.services';
import {CallQueuesServices} from '../services/call-queues.services';
import {SettingsServices} from '../services/settings.services';
import {DetailsAndRecordsServices} from '../services/details-and-records.services';
import {AddressBookServices} from '../services/address-book.services';
import {DepartmentServices} from '../services/department.services';
import {CallRulesServices} from '../services/call-rules.services';

import {SocketIoModule, SocketIoConfig} from 'ng-socket-io';
import {WsServices} from '../services/ws.services';
import {environment as _env} from '../environments/environment';
import {RefsServices} from '../services/refs.services';

const config: SocketIoConfig = {url: _env.ws, options: {transports: ['websocket']}};

@NgModule({
    declarations: [
        MainViewComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ComponentsModule,
        MainRouterModule,
        SocketIoModule.forRoot(config)
    ],
    providers: [
        LoggerServices,
        LocalStorageServices,
        {provide: HTTP_INTERCEPTORS, useClass: UserTokenInterceptor, multi: true},
        RequestServices,
        MessageServices,
        AuthorizationServices,
        UserServices,
        CallQueuesServices,
        SettingsServices,
        DetailsAndRecordsServices,
        SettingsServices,
        DepartmentServices,
        CallRulesServices,
        AddressBookServices,
        WsServices,
        RefsServices
    ],
    bootstrap: [MainViewComponent]
})
export class AppModule {
}
