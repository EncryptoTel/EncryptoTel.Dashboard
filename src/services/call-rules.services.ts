import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()

export class CallRulesServices {
  constructor(private request: RequestServices) {
  }

  getNumbers(): Promise<any> {
    return this.request.get(`v1/sip/outers`, true);
  }

  getParams(): Promise<any> {
    return this.request.get(`v1/outer_rule/params`, true);
  }

  getExtensions(id: number): Promise<any> {
    return this.request.get(`v1/sip/inners?sipOuter=${id}`, true);
  }

  getFiles(): Promise<any> {
    return this.request.get(`v1/account/file?type=audio`, true);
  }

  getQueue(): Promise<any> {
    return this.request.get(`v1/call_queue`, true);
  }

  save(rules): Promise<any> {
    return this.request.post(`v1/outer_rule`, rules, true);
  }

  getCallRules(): Promise<any> {
    return this.request.get(`v1/outer_rule`, true);
  }
}
