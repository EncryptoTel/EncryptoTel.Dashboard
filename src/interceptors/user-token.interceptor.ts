import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {UserModel} from '../models/user.model';

import {StorageServices} from '../shared/storage.services';

/*
  Intercept all outgoing requests and adding User-Token header for all of them if user already logged in
 */

@Injectable()
export class UserTokenInterceptor implements HttpInterceptor {
  constructor(private _storage: StorageServices) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user: UserModel = this._storage.readItem('user');
    if (user) {
      return next.handle(request.clone({
        headers: request.headers.append('User-Token', user.user_token)
      }));
    } else {
      return next.handle(request);
    }
  }
}
