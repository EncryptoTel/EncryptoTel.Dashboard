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
    announcePosition: true,
    maxlen: 60,
    description: '',
    queueMembers: []
  };

  save() {
    this.request.post('v1/call_queue', this.callQueue, true).then(res => {
    }).catch(err => {
    });
  }

  cancel() {
    this.callQueue = {
      sipId: 0,
      name: '',
      strategy: 0,
      timeout: 30,
      announceHoldtime: 0,
      announcePosition: true,
      maxlen: 60,
      description: '',
      queueMembers: []
    };
    this.router.navigate(['cabinet', 'call-queues']);
  }

  delete(id: number) {
    return this.request.del(`v1/call_queue/${id}`);
  }

  getQueues() {
    return this.request.get('v1/call_queue', true);
  }
}
