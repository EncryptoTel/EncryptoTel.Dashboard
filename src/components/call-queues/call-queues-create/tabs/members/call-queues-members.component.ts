import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../../../services/call-queues.services';
import {SipInner} from '../../../../../models/queue.model';

@Component({
  selector: 'pbx-call-queues-members',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesMembersComponent {
  constructor(private _services: CallQueuesServices) {
    this._services.userView.isCurCompMembersAdd = false;
  }

  members: SipInner[] = this._services.userView.members;

  table = {
    title: {
      titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
      keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'status']
    }
  };
}
