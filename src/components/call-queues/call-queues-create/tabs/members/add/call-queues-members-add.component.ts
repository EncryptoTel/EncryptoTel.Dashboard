import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../../../../services/call-queues.services';

@Component({
  selector: 'pbx-call-queues-members-add',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesMembersAddComponent {
  constructor(private _service: CallQueuesServices) {
    if (this._service.callQueue.sipId) {
      this.getMembers(this._service.callQueue.sipId);
    }
  }

  table = {
    title: {
      titles: ['', '#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
      keys: ['icon', 'ext', 'numbers', 'firstName', 'lastName', 'status']
    },
    items: [
      {
        icon: 'close', ext: '123', numbers: 'Antonon', firstName: 'Anton', lastName: 'Anton', status: 'enable'
      },
      {
        icon: 'close', ext: '111', numbers: 'Antonon', firstName: 'Anton', lastName: 'Anton', status: 'enable'
      },
      {
        icon: 'close', ext: '213', numbers: 'Antonon', firstName: 'Anton', lastName: 'Anton', status: 'enable'
      }
    ]
  };

  getMembers(id: number): void {
    this._service.getMembers(id).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }
}
