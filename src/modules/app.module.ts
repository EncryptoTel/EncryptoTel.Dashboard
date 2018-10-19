import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

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
import {TranslateServices} from '../services/translate.services';
import {CallQueueService} from '../services/call-queue.service';
import {SettingsService} from '../services/settings.service';
import {CdrService} from '../services/cdr.service';
import {AddressBookService} from '../services/address-book.service';
import {DepartmentService} from '../services/department.service';
import {CallRulesService} from '../services/call-rules.service';
import {RingGroupService} from '../services/ring-group.service';
import {IvrService} from '../services/ivr.service';
import {AudioConferenceService} from '../services/audio-conference.service';

import {SocketIoModule, SocketIoConfig} from 'ng-socket-io';
import {WsServices} from '../services/ws.services';
import {environment} from '../environments/environment';
import {RefsServices} from '../services/refs.services';
import {SizePipe} from '../services/size.pipe';
import {ClipboardModule} from 'ngx-clipboard';
import {DashboardServices} from '../services/dashboard.services';
import {CompanyService} from '../services/company.service';
import {SelectService} from '../services/state/select.service';
import {TariffStateService} from '../services/state/tariff.state.service';
import {StateService} from '../services/state/state.service';
import {LangStateService} from '../services/state/lang.state.service';
import {CookieService} from 'ngx-cookie-service';
import {RouterExtService} from '../services/router-ext.service';
import {PbxTranslateLoader} from '../shared/pbx-translate-loader';

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
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: PbxTranslateLoader,
                deps: [HttpClient]
            }
        }),
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
        TranslateServices,
        CallQueueService,
        SettingsService,
        CdrService,
        SettingsService,
        DepartmentService,
        CallRulesService,
        AddressBookService,
        WsServices,
        RefsServices,
        RingGroupService,
        SizePipe,
        IvrService,
        DashboardServices,
        CompanyService,
        SelectService,
        TariffStateService,
        StateService,
        LangStateService,
        CookieService,
        RouterExtService
    ],
    bootstrap: [MainViewComponent]
})
export class AppModule {
}

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}
