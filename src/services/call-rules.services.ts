import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()

export class CallRulesServices {
  constructor(private request: RequestServices) {
  }

  deleteCallRules(id: number): Promise<any> {
    return this.request.del(`v1/outer_rule/${id}`, true);
  }

  edit(id: number, rules): Promise<any> {
    return this.request.put(`v1/outer_rule/${id}`, rules, true);
  }

  getCallRules(): Promise<any> {
    return this.request.get(`v1/outer_rule`, true);
  }

  getEditedCallRule(id: number): Promise<any> {
    return this.request.get(`v1/outer_rule/${id}`, true);
  }

  getExtensions(id: number): Promise<any> {
    return this.request.get(`v1/sip/inners?sipOuter=${id}`, true);
  }

  getFiles(): Promise<any> {
    return this.request.get(`v1/account/file?type=audio`, true);
  }

  getParams(): Promise<any> {
    return this.request.get(`v1/outer_rule/params`, true);
  }

  getQueue(): Promise<any> {
    return this.request.get(`v1/call_queue`, true);
  }

  save(rules): Promise<any> {
    return this.request.post(`v1/outer_rule`, rules, true);
  }
}
