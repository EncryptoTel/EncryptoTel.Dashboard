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
import {CallQueueService} from '../services/call-queue.service';
import {SettingsServices} from '../services/settings.services';
import {DetailsAndRecordsServices} from '../services/details-and-records.services';
import {AddressBookService} from '../services/address-book.service';
import {DepartmentServices} from '../services/department.services';
import {CallRulesService} from '../services/call-rules.service';
import {RingGroupService} from '../services/ring-group.service';
import {IvrService} from '../services/ivr.service';

import {SocketIoModule, SocketIoConfig} from 'ng-socket-io';
import {WsServices} from '../services/ws.services';
import {environment} from '../environments/environment';
import {RefsServices} from '../services/refs.services';
import {NotificatorServices} from '../services/notificator.services';
import {SizePipe} from '../services/size.pipe';
import {ClipboardModule} from 'ngx-clipboard';
import {DashboardServices} from "../services/dashboard.services";

const config: SocketIoConfig = {url: environment.ws, options: {transports: ['websocket']}};

@NgModule({
    declarations: [
        MainViewComponent,
        SizePipe
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ComponentsModule,
        MainRouterModule,
        SocketIoModule.forRoot(config),
        ClipboardModule
    ],
    providers: [
        LoggerServices,
        LocalStorageServices,
        {provide: HTTP_INTERCEPTORS, useClass: UserTokenInterceptor, multi: true},
        RequestServices,
        MessageServices,
        AuthorizationServices,
        UserServices,
        CallQueueService,
        SettingsServices,
        DetailsAndRecordsServices,
        SettingsServices,
        DepartmentServices,
        CallRulesService,
        AddressBookService,
        WsServices,
        RefsServices,
        RingGroupService,
        NotificatorServices,
        SizePipe,
        IvrService,
        DashboardServices
    ],
    bootstrap: [MainViewComponent]
})
export class AppModule {
}
