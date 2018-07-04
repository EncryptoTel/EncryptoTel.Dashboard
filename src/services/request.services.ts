import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import {LoggerServices} from './logger.services';
import {MessageServices} from './message.services';
import {environment as _env} from '../environments/environment';
import {Router} from '@angular/router';
import {LocalStorageServices} from './local-storage.services';

/*
  Parent request services. Processing errors and console output for responses
*/

@Injectable()
export class RequestServices {
    constructor(private http: HttpClient,
                private _messages: MessageServices,
                private logger: LoggerServices,
                private router: Router,
                private storage: LocalStorageServices) {
        this.lastTick = null;
        this.setTimer();
    }

    protected counter = 0;
    protected lastCounter = 0;
    protected timer = null;
    protected lastTick;

    protected beginRequest() {
        this.counter += 1;
        this.saveLastUrl();
    }

    protected endRequest() {
        if (!this.lastTick) {
            this.getRefreshToken();
        }
    }

    protected getRefreshToken() {
        const user = this.storage.readItem('pbx_user');
        if (!user) {
            this.lastTick = null;
            return null;
        } else {
            this.updateTick();
        }
        return user['secrets']['refresh_token'];
    }

    protected updateSecrets(secrets) {
        const user = this.storage.readItem('pbx_user');
        user['secrets'] = secrets;
        this.storage.writeItem('pbx_user', user);
    }

    public updateTick() {
        if (!this.lastTick) {
            this.lastTick = new Date();
        }
    }

    protected setTimer() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (this.lastTick) {
                let currentTick = new Date();
                let ticksBetween = Math.round((currentTick.getTime() - this.lastTick.getTime()) / 1000);
                // console.log(ticksBetween);
                if (this.lastCounter != this.counter && ticksBetween > 5 * 60) {
                    let token = this.getRefreshToken();
                    if (token) {
                        this.post(`refresh-token`, {refresh_token: token}, true).then(res => {
                            this.updateSecrets(res);
                            // console.log(res);
                        });
                        this.lastCounter = this.counter;
                        this.lastTick = new Date();
                    }
                }
            }
            this.setTimer();
        }, 1000);
    }

    private catchSuccess(response): Promise<any> {
        this.endRequest();
        this.logger.log('request response', response); // Console output for response
        return Promise.resolve(response.body); // Return response body to children method
    }

    private catchError(response): Promise<any> {
        this.endRequest();
        switch (response.status) { // Switch response error status
            case 401: {
                localStorage.removeItem('pbx_user');
                this.router.navigate(['/sign-in']);
                break;
            }
            default: {
                this._messages.writeError(response.error.message || 'Internal server error'); // Adding warning message
                break;
            }
        }
        this.logger.log('request error', { // Console output for response error details
            status: response.status || 'Response status is empty',
            message: response.error.message || 'Unknown internal server error'
        });
        return Promise.reject(response.error);
    }

    /*
      Default POST request. Accepted params:
      URI: string - request uri,
      Data: object - request params
     */
    post(url: string, data: object, serverReady: boolean = false): Promise<any> {
        return this.request('POST', url, {...data});
    }

    /*
      Default PUT request. Accepted params:
      URI: string - request uri,
      Data: object - request params
     */
    put(url: string, data: object, serverReady: boolean = false): Promise<any> {
        return this.request('PUT', url, {...data});
    }

    /*
      Default GET request. Accepted params:
      URI: string - request uri with stringified params
     */
    get(url: string, serverReady: boolean = false): Promise<any> {
        return this.request('GET', url, null);
    }

    /*
      Default DELETE request. Accepted params:
      URI: string - request uri with stringified params
     */
    del(url: string, serverReady: boolean = false): Promise<any> {
        return this.request('DELETE', url, null);
    }

    request(method: string, url: string, body: any): Promise<any> {
        this.beginRequest();
        return this.http.request(method, `${_env.back}/${url}`, {body: body, observe: 'response'}).toPromise().then(response => {
            return this.catchSuccess(response);
        }).catch(response => {
            return this.catchError(response);
        });
    }

    saveLastUrl() {
        const URL = this.router.url;
        if (URL.startsWith('/cabinet/')) {
            this.storage.writeItem('pbx_url', URL);
        }
    }

}
