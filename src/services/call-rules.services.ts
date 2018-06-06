import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()

export class CallRulesServices {
  constructor(private request: RequestServices) {
  }

  getNumbers(): Promise<any> {
    return this.request.get(`v1/sip/outers`, true);
  }
}
