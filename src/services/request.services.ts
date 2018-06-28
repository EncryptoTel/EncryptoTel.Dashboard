import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import {LoggerServices} from './logger.services';
import {MessageServices} from './message.services';

import {environment as _env} from '../environments/environment';
import {Router} from '@angular/router';

/*
  Parent request services. Processing errors and console output for responses
*/

@Injectable()
export class RequestServices {
  constructor(private http: HttpClient,
              private _messages: MessageServices,
              private logger: LoggerServices,
              private router: Router) {}

  /*
    Default POST request. Accepted params:
    URI: string - request uri,
    Data: object - request params
   */
  post(uri: string, data: object, serverReady: boolean = false): Promise<any> {
    return this.http.post(`${serverReady ? _env.back : _env.ph}/${uri}`, {...data}, {observe: 'response'}).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log('POST-request response', response); // Console output for response
        return Promise.resolve(response.body); // Return response body to children method
      }).catch(response => { // Non-successful request processing
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
    return this.http.put(`${serverReady ? _env.back : _env.ph}/${uri}`, {...data}, {observe: 'response'}).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log('PUT-request response', response); // Console output for response
        return Promise.resolve(response.body); // Return response body to children method
      }).catch(response => { // Non-successful request processing
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
    return this.http.get(`${serverReady ? _env.back : _env.ph}/${uri}`, {observe: 'response'}).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log('GET-request response', response); // Console output for response
        return Promise.resolve(response.body); // Return response body to children method
      }).catch(response => { // Non-successful request processing
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
    return this.http.delete(`${serverReady ? _env.back : _env.ph}/${uri}`, {observe: 'response'}).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log('DELETE-request response', response); // Console output for response
        return Promise.resolve(response.body); // Return response body to children method
      }).catch(response => { // Non-successful request processing
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
