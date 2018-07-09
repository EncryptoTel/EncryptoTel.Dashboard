import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../../../services/call-queues.services';
import {SipInner} from '../../../../../models/queue.model';
import {FadeAnimation} from '../../../../../shared/fade-animation';

@Component({
  selector: 'pbx-call-queues-members',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class CallQueuesMembersComponent {
  constructor(private _services: CallQueuesServices) {
    this._services.userView.isCurCompMembersAdd = false;
  }

  members: SipInner[] = this._services.userView.members;

  table = {
    title: {
      titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
      keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
    }
  };

  deleteMember(memberId) {
    for (let i = 0; i < this._services.callQueue.queueMembers.length; i++) {
      if (memberId.id === this._services.callQueue.queueMembers[i].sipId) {
        this._services.callQueue.queueMembers.splice(i, 1);
        this._services.userView.members.splice(i, 1);
        return; }}
  }
}
