import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import * as _vars from '../shared/vars';

/*
  Intercept all outgoing requests and adding Api-Key header for all of them
 */

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request.clone({
      headers: request.headers.append('Api-Key', _vars.key)
    }));
  }
}
