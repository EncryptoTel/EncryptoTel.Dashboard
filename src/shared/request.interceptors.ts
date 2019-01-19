import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { UserModel } from '@models/user.model';
import { LocalStorageServices } from '@services/local-storage.services';


/**
 * Intercepts all outgoing requests and adds User-Token header for all of them
 * if user has already logged in
 */
@Injectable()
export class UserTokenInterceptor implements HttpInterceptor {

    constructor(
        private storage: LocalStorageServices,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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
}
