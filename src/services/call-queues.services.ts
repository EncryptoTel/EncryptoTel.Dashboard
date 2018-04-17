import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {QueueModel} from '../models/queue.model';
import {Router} from '@angular/router';

@Injectable()
export class CallQueuesServices {
  constructor(private request: RequestServices,
              private router: Router) {
  }

  callQueue: QueueModel = {
    sipId: 0,
    name: '',
    strategy: 0,
    timeout: 30,
    announceHoldtime: 0,
    announcePosition: false,
    maxlen: 60,
    description: '',
    queueMembers: []
  };
  userView = {
    phoneNumber: '',
    announceHoldtime: false,
    members: [],
    isCurCompMembersAdd: false,
    strategy: {
      code: ''
    }
  };

  save(): void {
    this.request.post('v1/call_queue', this.callQueue, true).then(res => {
    }).catch(err => {
    });
  }

  cancel(): void {
    this.callQueue = {
      sipId: 0,
      name: '',
      strategy: 0,
      timeout: 30,
      announceHoldtime: 0,
      announcePosition: false,
      maxlen: 60,
      description: '',
      queueMembers: []
    };
    this.userView = {
      phoneNumber: '',
      announceHoldtime: false,
      members: [],
      isCurCompMembersAdd: false,
      strategy: {
        code: ''
      }
    };
    this.router.navigate(['cabinet', 'call-queues']);
  }

  delete(id: number) {
    return this.request.del(`v1/call_queue/${id}`);
  }

  search(value: string) {
    return this.request.post(`v1/call_queue/members`, {sipOuter: this.callQueue.sipId, q: value}, true);
  }

  getQueues() {
    return this.request.get('v1/call_queue', true);
  }

  getNumbers() {
    return this.request.get(`v1/sip/outers`, true);
  }

  getParams() {
    return this.request.get(`v1/call_queue/params`, true);
  }

  getMembers(id: number) {
    return this.request.get(`v1/sip/inners/${id}`, true);
  }
}
