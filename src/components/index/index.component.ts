import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {MessageServices} from '../../services/message.services';
import {NavigationItemModel} from '../../models/navigation-item.model';

@Component({
  selector: 'pbx-index',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class IndexComponent implements OnInit {
  constructor(private _messages: MessageServices,
              private _router: Router) {}
  navigationList: NavigationItemModel[][] = [
    [{
      id: 0,
      title: 'Dashboard',
      link: 'dashboard',
      icon: 'dashboard',
      status: true
    }, {
      id: 1,
      title: 'Phone numbers',
      link: 'phone-numbers',
      icon: 'phone_numbers',
      status: true
    }, {
      id: 2,
      title: 'Address book',
      link: 'address-book',
      icon: 'address_book',
      status: true
    }],
    [{
      id: 3,
      title: 'Call rules',
      link: 'call-rules',
      icon: 'call_rules',
      status: true
    }, {
      id: 4,
      title: 'Call queues',
      link: 'call-queues',
      icon: 'call_queues',
      status: true
    }, {
      id: 5,
      title: 'Ring groups',
      link: 'ring-groups',
      icon: 'ring_groups',
      status: true
    }, {
      id: 6,
      title: 'IVR',
      link: 'ivr',
      icon: 'ivr',
      status: true
    }],
    [{
      id: 7,
      title: 'Company',
      link: 'company',
      icon: 'company',
      status: true
    }, {
      id: 8,
      title: 'Departments',
      link: 'departments',
      icon: 'departments',
      status: true
    }, {
      id: 9,
      title: 'Employees',
      link: 'employees',
      icon: 'employees',
      status: true
    }],
    [{
      id: 10,
      title: 'Details and records',
      link: 'details-and-records',
      icon: 'details_and_records',
      status: true
    }, {
      id: 11,
      title: 'Invoices',
      link: 'invoices',
      icon: 'invoices',
      status: true
    }],
    [{
      id: 12,
      title: 'Storage',
      link: 'storage',
      icon: 'storage',
      status: true
    }, {
      id: 13,
      title: 'Settings',
      link: 'settings',
      icon: 'settings',
      status: true
    }]
  ];
  logout() {
    localStorage.clear();
    this._messages.writeSuccess('Logout successful');
    return this._router.navigate(['../sign-in']);
  }
  ngOnInit() {
  }
}
