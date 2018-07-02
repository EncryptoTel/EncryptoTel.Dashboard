import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';

/*
  Logger service. Use it for debug instead of default console output. Accepted params:
  Data - any
*/

@Injectable()
export class LoggerServices {
  log = (details: string, data: any): void => {
    if (!environment.production) {
      // console.log(`---Logger message---\n`, `${details}\n\n`, data);
    }
  }
}
