import {Component} from '@angular/core';

@Component({
  selector: 'pbx-call-queues-members-add',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesMembersAddComponent {
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
