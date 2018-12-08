import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {UserModel} from '../models/user.model';

import {LocalStorageServices} from '../services/local-storage.services';

import {Router} from '@angular/router';

/*
  Intercept all outgoing requests and adding User-Token header for all of them if user already logged in
 */

@Injectable()
export class UserTokenInterceptor implements HttpInterceptor {

    constructor(
        private _storage: LocalStorageServices,
        private _router: Router
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const user: UserModel = this._storage.readItem('pbx_user');
        if ( user) {
            const type = user.secrets.token_type;
            return next.handle(request.clone({
                headers: request.headers.append('Authorization', `Bearer ${user.secrets.access_token}`)
            }));
        }else {
            console.log('handle', request);
            return next.handle(request);
        }
    }
}
