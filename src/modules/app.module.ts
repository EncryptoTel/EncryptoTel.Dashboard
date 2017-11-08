import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {ApiKeyInterceptor} from '../interceptors/api-key.interceptor';
import {UserTokenInterceptor} from '../interceptors/user-token.interceptor';

import {MainRouterModule} from './router.module';
import {ComponentsModule} from './components.module';

import {LoggerServices} from '../shared/logger.services';
import {StorageServices} from '../shared/storage.services';
import {RequestServices} from '../shared/request.services';
import {UserServices} from '../shared/user.services';

import {MainViewComponent} from '../components/main-view.component';

@NgModule({
  declarations: [
    MainViewComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ComponentsModule,
    MainRouterModule
  ],
  providers: [
    LoggerServices,
    StorageServices,
    {provide: HTTP_INTERCEPTORS, useClass: ApiKeyInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: UserTokenInterceptor, multi: true},
    RequestServices,
    UserServices
  ],
  bootstrap: [MainViewComponent]
})
export class AppModule { }
