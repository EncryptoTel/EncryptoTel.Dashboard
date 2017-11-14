import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import * as _vars from './vars';

import {LoggerServices} from './logger.services';
import {MessageServices} from './message.services';

/*
  Parent request services. Processing errors and console output for responses
*/

@Injectable()
export class RequestServices {
  constructor(private http: HttpClient,
              private message: MessageServices,
              private logger: LoggerServices) {}
  /*
    Default POST request. Accepted params:
    URI: string - request uri,
    data: object - request params
   */
  post(uri: string, data: object): Promise<any> {
    return this.http.post(`${_vars.back}/${uri}`, {...data}, {observe: 'response'}).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log(response); // Console output for response
        return response; // Return response to children method
      }).catch(response => { // Non-successful request processing
        this.logger.log({status: response.status});
        switch (response.status) { // Switch response error status
          case 500: {
            this.message.writeError(response.message); // Adding warning message
            break;
          }
          default: {
            this.message.writeWarning(response.message); // Adding warning message
            break;
          }
        }
        this.logger.log({ // Console output for response error details
          status: response.status,
          message: response.error.message
        });
      });
  }
  /*
    Default PUT request. Accepted params:
    URI: string - request uri,
    data: object - request params
   */
  put(uri: string, data: object): Promise<any> {
    return this.http.put(`${_vars.back}/${uri}`, {...data}).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log(response); // Console output for response
        return response; // Return response to children method
      }).catch(response => { // Non-successful request processing
        this.logger.log({status: response.status});
        switch (response.status) { // Switch response error status
          case 500: {
            this.message.writeError(response.message); // Adding warning message
            break;
          }
          default: {
            this.message.writeWarning(response.message); // Adding warning message
            break;
          }
        }
        this.logger.log({ // Console output for response error details
          status: response.status,
          message: response.error.message
        });
      });
  }
  /*
    Default GET request. Accepted params:
    URI: string - request uri with stringified params
   */
  get(uri: string): Promise<any> {
    return this.http.get(`${_vars.back}/${uri}`).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log(response); // Console output for response
        return response; // Return response to children method
      }).catch(response => { // Non-successful request processing
        this.logger.log({status: response.status});
        switch (response.status) { // Switch response error status
          case 500: {
            this.message.writeError(response.message); // Adding warning message
            break;
          }
          default: {
            this.message.writeWarning(response.message); // Adding warning message
            break;
          }
        }
        this.logger.log({ // Console output for response error details
          status: response.status,
          message: response.error.message
        });
      });
  }
  /*
    Default DELETE request. Accepted params:
    URI: string - request uri with stringified params
   */
  del(uri: string): Promise<any> {
    return this.http.delete(`${_vars.back}/${uri}`).toPromise() // Request to promise conversion
      .then(response => { // Successful request processing
        this.logger.log(response); // Console output for response
        return response; // Return response to children method
      }).catch(response => { // Non-successful request processing
        this.logger.log({status: response.status});
        switch (response.status) { // Switch response error status
          case 500: {
            this.message.writeError(response.message); // Adding warning message
            break;
          }
          default: {
            this.message.writeWarning(response.message); // Adding warning message
            break;
          }
        }
        this.logger.log({ // Console output for response error details
          status: response.status,
          message: response.error.message
        });
      });
  }
}
