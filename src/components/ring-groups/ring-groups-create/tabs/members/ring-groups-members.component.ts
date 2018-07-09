import {Component} from '@angular/core';
import {RingGroupsServices} from '../../../../../services/ring-groups.service';
import {SipInner} from '../../../../../models/queue.model';
import {FadeAnimation} from '../../../../../shared/fade-animation';

@Component({
  selector: 'ring-groups-members',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class RingGroupsMembersComponent {
  constructor(private _services: RingGroupsServices) {
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
    const indexCallQueue = this._services.ringGroups.queueMembers.findIndex(el => {
      if (el.sipId === memberId) {
        return true;
      }
    });
    const indexView = this._services.userView.members.findIndex(el => {
      if (el.id === memberId) {
        return true;
      }
    });
    this._services.ringGroups .queueMembers.splice(indexCallQueue, 1);
    this._services.userView.members.splice(indexView, 1);
  }
}
