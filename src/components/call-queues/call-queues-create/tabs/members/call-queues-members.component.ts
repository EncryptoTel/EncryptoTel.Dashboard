import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../../../services/call-queues.services';

@Component({
  selector: 'pbx-call-queues-members',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesMembersComponent {
  constructor(private _services: CallQueuesServices) {}

  members = this._services.userView.members;

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
}
