import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';

/*
  Logger service. Use it for debug instead of default console output. Accepted params:
  Data - any
*/

@Injectable()
export class LoggerServices {

    blackList = ['WsServices'];

    log = (details: string, data: any): void => {
        if (!environment.production) {
            console.log(`${details}\n\n`, data);
        }
    }

    logEx = (obj: any, details: string, data: any): void => {
        if (!environment.production && this.blackList.indexOf(obj.constructor.name) === -1) {
            console.log(`${obj.constructor.name}: ${details}\n\n`, data);
        }
    }

}
