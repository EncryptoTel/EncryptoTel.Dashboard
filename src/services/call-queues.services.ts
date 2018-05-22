import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {QueueModel, QueuesParams} from '../models/queue.model';
import {Router} from '@angular/router';

@Injectable()
export class CallQueuesServices {
  constructor(private request: RequestServices,
              private router: Router) {
  }

  editMode = false;
  params: QueuesParams = {
    announceHoldtimes: [],
    strategies: []
  };
  callQueue: QueueModel = {
    sipId: 0,
    name: '',
    strategy: 0,
    timeout: 30,
    announceHoldtime: 0,
    announcePosition: 0,
    maxlen: 60,
    description: '',
    queueMembers: []
  };
  userView = {
    phoneNumber: '',
    announceHoldtime: false,
    announcePosition: false,
    members: [],
    isCurCompMembersAdd: false,
    strategy: {
      code: ''
    }
  };

  save(id): void {
    if (this.editMode) {
      this.request.put(`v1/call_queue/${id}`, this.callQueue, true);
    } else {
      this.request.post('v1/call_queue', this.callQueue, true);
    }
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
      announcePosition: false,
      members: [],
      isCurCompMembersAdd: false,
      strategy: {
        code: ''
      }
    };
    this.router.navigate(['cabinet', 'call-queues']);
  }

  setStrategiesFromId() {
    this.params.strategies.forEach(el => {
      if (el.id === this.callQueue.strategy) {
        this.userView.strategy.code = el.code;
      }
    });
  }

  delete(id: number) {
    return this.request.del(`v1/call_queue/${id}`, true);
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
    this.request.get(`v1/call_queue/params`, true).then((res: QueuesParams) => {
      this.params = res;
      if (this.editMode) {
        this.setStrategiesFromId();
      }
    }).catch(err => {
      console.error(err);
    });
  }

  getMembers(id: number) {
    return this.request.post(`v1/call_queue/members`, {sipOuter: id}, true);
  }

  getDepartments() {
    return this.request.get(`v1/department`, true);
  }

  getCallQueue(id) {
    return this.request.get(`v1/call_queue/${id}`, true);
  }
}
