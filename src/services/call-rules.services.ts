import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()

export class CallRulesServices {
  constructor(private request: RequestServices) {
  }

  deleteCallRules(id: number): Promise<any> {
    return this.request.del(`v1/outer_rule/${id}`);
  }

  edit(id: number, rules): Promise<any> {
    return this.request.put(`v1/outer_rule/${id}`, rules);
  }

  getCallRules(page: number): Promise<any> {
    return this.request.get(`v1/outer_rule?page=${page}`);
  }

  getEditedCallRule(id: number): Promise<any> {
    return this.request.get(`v1/outer_rule/${id}`);
  }

  getExtensions(id: number): Promise<any> {
    return this.request.get(`v1/sip/inners?sipOuter=${id}`);
  }

  getFiles(): Promise<any> {
    return this.request.get(`v1/account/file?type=audio`);
  }

  getParams(): Promise<any> {
    return this.request.get(`v1/outer_rule/params`);
  }

  getQueue(): Promise<any> {
    return this.request.get(`v1/call_queue`);
  }

  save(rules): Promise<any> {
    return this.request.post(`v1/outer_rule`, rules);
  }
}
