import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../../../../services/call-queues.services';
import {Departments, Members, SipInner} from '../../../../../../models/queue.model';
import {FadeAnimation} from '../../../../../../shared/fade-animation';

@Component({
  selector: 'ring-groups-members-add',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class RingGroupsMembersAddComponent {
  constructor(private _service: CallQueuesServices) {
    if (this._service.callQueue.sipId) {
      this.getMembers(this._service.callQueue.sipId);
      this.getDepartments();
    }
    this._service.userView.isCurCompMembersAdd = true;
  }

  loading = true;
  members: SipInner[] = [];
  departments: any[] = [];
  table = {
    title: {
      titles: ['#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
      keys: ['phoneNumber', 'sipOuterPhone', 'firstName', 'lastName', 'statusName']
    }
  };

  selectMember(member: SipInner): void {
    console.log(member);
    const checkResult = this._service.callQueue.queueMembers.find(el => {
      return el.sipId === member.id;
    });
    if (!checkResult) {
      this._service.callQueue.queueMembers.push({sipId: member.id});
      this._service.userView.members.push(member);
    }
  }

  deleteMember(id: number): void {
    const checkResult = this._service.callQueue.queueMembers.findIndex(el => {
      return el.sipId === id;
    });
    if (checkResult >= 0) {
      this._service.callQueue.queueMembers.splice(checkResult, 1);
      this._service.userView.members.splice(checkResult, 1);
    }
  }

  search(event): void {
    const search = event.target.value;
    this._service.search(search).then(res => {
      this.members = res.items;
      this.addPhoneNumberField();
    }).catch(err => {
      console.error(err);
    });
  }

  private getMembers(id: number): void {
    this._service.getMembers(id).then((res: Members) => {
      this.members = res.items;
      this.loading = false;
      this.addPhoneNumberField();
    }).catch(err => {
      console.error(err);
    });
  }

  private addPhoneNumberField(): void {
    for (let i = 0; i < this.members.length; i++) {
      this.members[i].sipOuterPhone = this._service.userView.phoneNumber;
    }
  }

  private getDepartments() {
    this._service.getDepartments().then((res: Departments) => {
      this.departments = res.items;
    }).catch(err => {
      console.error(err);
    });
  }
}
