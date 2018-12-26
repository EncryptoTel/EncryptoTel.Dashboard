import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse} from '@angular/common/http';

import {UserModel} from '../models/user.model';

import {LocalStorageServices} from '../services/local-storage.services';

import {Router} from '@angular/router';
import {RequestServices} from '@services/request.services';

/*
  Intercept all outgoing requests and adding User-Token header for all of them if user already logged in
 */

@Injectable()
export class UserTokenInterceptor implements HttpInterceptor {

    constructor(
        private service: RequestServices,
        private storage: LocalStorageServices
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (window.navigator.onLine) {
            this.service.connected = true;

            const user: UserModel = this.storage.readItem('pbx_user');
    
            if (user) {
                return next.handle(request.clone({
                    headers: request.headers.append('Authorization', `Bearer ${user.secrets.access_token}`)
                }));
            }
            else {
                return next.handle(request);
            }
        }
        else {
            this.service.connected = false;
            return Observable.throw(new HttpErrorResponse({ error: 'No Internet connection' }));
        }
    }
}
