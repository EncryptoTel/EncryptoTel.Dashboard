import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import * as _vars from './vars';

import {LoggerServices} from './logger.services';

@Injectable()
export class RequestServices {
  constructor(private http: HttpClient,
              private logger: LoggerServices) {}
  /*
    Default POST request. Accepted params:
    URI: string - request uri,
    data: object - request params
   */
  post(uri: string, data: object) {
    return this.http.post(`${_vars.back}/${uri}`, {...data}).toPromise()
      .then(response => {
        this.logger.log(response);
        return response;
      }).catch(error => {
        this.logger.log({
          status: error.status,
          ...error.error
        });
      });
  }
  /*
    Default PUT request. Accepted params:
    URI: string - request uri,
    data: object - request params
   */
  put(uri: string, data: object) {
    return this.http.put(`${_vars.back}/${uri}`, {...data}).toPromise()
      .then(response => {
        this.logger.log(response);
        return response;
      }).catch(error => {
        this.logger.log({
          status: error.status,
          ...error.error
        });
      });
  }
  /*
    Default GET request. Accepted params:
    URI: string - request uri with stringified params
   */
  get(uri: string) {
    return this.http.get(`${_vars.back}/${uri}`).toPromise()
      .then(response => {
        this.logger.log(response);
        return response;
      }).catch(error => {
        this.logger.log({
          status: error.status,
          ...error.error
        });
      });
  }
  /*
    Default DELETE request. Accepted params:
    URI: string - request uri with stringified params
   */
  del(uri: string) {
    return this.http.delete(`${_vars.back}/${uri}`).toPromise()
      .then(response => {
        this.logger.log(response);
        return response;
      }).catch(error => {
        this.logger.log({
          status: error.status,
          ...error.error
        });
      });
  }
}
