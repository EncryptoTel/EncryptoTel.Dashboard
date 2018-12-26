import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHeaders, HttpResponse, HttpResponseBase} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {catchError, map} from 'rxjs/operators';
import 'rxjs/add/observable/throw';
import {TranslateService} from '@ngx-translate/core';

import {UserModel} from '@models/user.model';
import {LocalStorageServices} from '@services/local-storage.services';
import {MessageServices} from '@services/message.services';
import {RequestServices} from '@services/request.services';


/**
 * Intercept all outgoing requests and adding User-Token header for all of them if user already logged in
 */
@Injectable()
export class UserTokenInterceptor implements HttpInterceptor {

    connected: boolean = true;
    noConnectionStatuses: number[] = [ 0, 500, 504 ];

    constructor(
        private injector: Injector
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> | null {
        const storage: LocalStorageServices = this.injector.get(LocalStorageServices);
        const user: UserModel = storage.readItem('pbx_user');
        
        if (user) {
            request = request.clone({
                headers: request.headers.append('Authorization', `Bearer ${user.secrets.access_token}`)
            });
        }

        return next
            .handle(request)
            .pipe(
                map(response => {
                    console.log('http-ok', this.connected, response);
                    if (response instanceof HttpResponseBase) {
                        this.connected = true;
                        const service: RequestServices = this.injector.get(RequestServices);
                        service.connected = true;
                    }
                    return response;
                }),
                catchError((error/*: HttpErrorResponse*/) => {
                    this.handleError(error);
                    return Observable.throw(error);
                })
            )
            ;
    }

    handleError(error: any /*HttpErrorResponse*/): void {
        console.log('http-error', this.connected, error);
        const service: RequestServices = this.injector.get(RequestServices);
        if (this.noConnectionStatuses.includes(error.status)) {
            if (this.connected) {
                this.connected = false;
                service.connected = false;
            }
        }
        else if (error.status === 200) {
            // window.location.reload();
            // this.connected = true;
            // service.connected = true;
        }
    }
}
