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

  deleteMember(memberId) {
    const indexCallQueue = this._services.callQueue.queueMembers.findIndex(el => {
      if (el.sipId === memberId) {
        return true;
      }
    });
    const indexView = this._services.userView.members.findIndex(el => {
      if (el.id === memberId) {
        return true;
      }
    });
    this._services.callQueue.queueMembers.splice(indexCallQueue, 1);
    this._services.userView.members.splice(indexView, 1);
  }
}
