import {Component} from '@angular/core';

@Component({
  selector: 'pbx-call-queues-members',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesMembersComponent {
  table = {
    title: {
      titles: ['', '#Ext', 'Phone number', 'First Name', 'Last Name', 'Status'],
      keys: ['icon', 'ext', 'numbers', 'firstName', 'lastName', 'status']
    },
    items: [
      {
        icon: 'close', ext: 'Anton', numbers: 'Antonon', firstName: 'Anton', lastName: 'Anton', status: 'enable'
      }, {
        icon: 'close', ext: 'Anton', numbers: 'Antonon', firstName: 'Anton', lastName: 'Anton', status: 'enable'
      }, {
        icon: 'close', ext: 'Anton', numbers: 'Antonon', firstName: 'Anton', lastName: 'Anton', status: 'enable'
      }
    ]
  };
}
