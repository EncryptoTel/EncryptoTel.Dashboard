import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import {LoggerServices} from './logger.services';
import {MessageServices} from './message.services';
import {environment as _env} from '../environments/environment';
import {Router} from '@angular/router';
import {StorageServices} from "./storage.services";

/*
  Parent request services. Processing errors and console output for responses
*/

@Injectable()
export class RequestServices {
    constructor(private http: HttpClient,
                private _messages: MessageServices,
                private logger: LoggerServices,
                private router: Router,
                private storage: StorageServices) {
        this.lastTick = null;
        this.setTimer();
    }

    protected counter = 0;
    protected lastCounter = 0;
    protected timer = null;
    protected lastTick;

    protected beginRequest() {
        this.counter += 1;
    }

    protected endRequest() {
        if (!this.lastTick) {
            this.getRefreshToken();
        }
    }

    protected getRefreshToken() {
        const user = this.storage.readItem('pbx_user');
        // console.log(user);
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

    /*
      Default POST request. Accepted params:
      URI: string - request uri,
      Data: object - request params
     */
    post(uri: string, data: object, serverReady: boolean = false): Promise<any> {
        this.beginRequest();
        return this.http.post(`${serverReady ? _env.back : _env.ph}/${uri}`, {...data}, {observe: 'response'}).toPromise() // Request to promise conversion
            .then(response => { // Successful request processing
                this.endRequest();
                this.logger.log('POST-request response', response); // Console output for response
                return Promise.resolve(response.body); // Return response body to children method
            }).catch(response => { // Non-successful request processing
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
                this.logger.log('POST-request error', { // Console output for response error details
                    status: response.status || 'Response status is empty',
                    message: response.error.message || 'Unknown internal server error'
                });
                return Promise.reject(response.error);
            });
    }

    /*
      Default PUT request. Accepted params:
      URI: string - request uri,
      Data: object - request params
     */
    put(uri: string, data: object, serverReady: boolean = false): Promise<any> {
        this.beginRequest();
        return this.http.put(`${serverReady ? _env.back : _env.ph}/${uri}`, {...data}, {observe: 'response'}).toPromise() // Request to promise conversion
            .then(response => { // Successful request processing
                this.endRequest();
                this.logger.log('PUT-request response', response); // Console output for response
                return Promise.resolve(response.body); // Return response body to children method
            }).catch(response => { // Non-successful request processing
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
                this.logger.log('PUT-request error', { // Console output for response error details
                    status: response.status || 'Response status is empty',
                    message: response.error.message || 'Unknown internal server error'
                });
                return Promise.reject(response.error);
            });
    }

    /*
      Default GET request. Accepted params:
      URI: string - request uri with stringified params
     */
    get(uri: string, serverReady: boolean = false): Promise<any> {
        this.beginRequest();
        return this.http.get(`${serverReady ? _env.back : _env.ph}/${uri}`, {observe: 'response'}).toPromise() // Request to promise conversion
            .then(response => { // Successful request processing
                this.endRequest();
                this.logger.log('GET-request response', response); // Console output for response
                return Promise.resolve(response.body); // Return response body to children method
            }).catch(response => { // Non-successful request processing
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
                this.logger.log('GET-request error', { // Console output for response error details
                    status: response.status || 'Response status is empty',
                    message: response.error.message || 'Unknown internal server error'
                });
                return Promise.reject(response.error);
            });
    }

    /*
      Default DELETE request. Accepted params:
      URI: string - request uri with stringified params
     */
    del(uri: string, serverReady: boolean = false): Promise<any> {
        this.beginRequest();
        return this.http.delete(`${serverReady ? _env.back : _env.ph}/${uri}`, {observe: 'response'}).toPromise() // Request to promise conversion
            .then(response => { // Successful request processing
                this.endRequest();
                this.logger.log('DELETE-request response', response); // Console output for response
                return Promise.resolve(response.body); // Return response body to children method
            }).catch(response => { // Non-successful request processing
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
                this.logger.log('DELETE-request error', { // Console output for response error details
                    status: response.status || 'Response status is empty',
                    message: response.error.message || 'Unknown internal server error'
                });
                return Promise.reject(response.error);
            });
    }
}
