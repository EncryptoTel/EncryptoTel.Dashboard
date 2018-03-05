import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {MessageServices} from '../../services/message.services';
import {UserServices} from '../../services/user.services';
import {BalanceServices} from '../../services/balance.services';

import {NavigationItemModel} from '../../models/navigation-item.model';
import {UserModel} from '../../models/user.model';
import {BalanceModel} from '../../models/balance.model';
import {MainViewComponent} from '../main-view.component';

import {SwipeAnimation} from '../../shared/swipe-animation';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-index',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '200ms'), FadeAnimation('100ms')]
})

export class IndexComponent implements OnInit, OnDestroy {
  constructor(private _user: UserServices,
              private _balance: BalanceServices,
              private _messages: MessageServices,
              private _router: Router,
              public _main: MainViewComponent) {}
  navigationList: NavigationItemModel[][] = [
    [{
      id: 0,
      title: 'Dashboard',
      link: 'dashboard',
      icon: 'dashboard',
      status: true,
      visible: true
    }, {
      id: 1,
      title: 'Phone numbers',
      link: 'phone-numbers',
      icon: 'phone_numbers',
      status: false,
      visible: true
    }, {
      id: 2,
      title: 'Address book',
      link: 'address-book',
      icon: 'address_book',
      status: false,
      visible: true
    }],
    [{
      id: 3,
      title: 'Call rules',
      link: 'call-rules',
      icon: 'call_rules',
      status: false,
      visible: true
    }, {
      id: 4,
      title: 'Call queues',
      link: 'call-queues',
      icon: 'call_queues',
      status: false,
      visible: true
    }, {
      id: 5,
      title: 'Ring groups',
      link: 'ring-groups',
      icon: 'ring_groups',
      status: false,
      visible: true
    }, {
      id: 6,
      title: 'IVR',
      link: 'ivr',
      icon: 'ivr',
      status: false,
      visible: true
    }],
    [{
      id: 7,
      title: 'Company',
      link: 'company',
      icon: 'company',
      status: false,
      visible: true
    }, {
      id: 8,
      title: 'Departments',
      link: 'departments',
      icon: 'departments',
      status: false,
      visible: true
    }, {
      id: 9,
      title: 'Extensions',
      link: 'extensions',
      icon: 'extensions',
      status: false,
      visible: true
    }],
    [{
      id: 10,
      title: 'Details and records',
      link: 'details-and-records',
      icon: 'details_and_records',
      status: false,
      visible: true
    }, {
      id: 11,
      title: 'Invoices',
      link: 'invoices',
      icon: 'invoices',
      status: false,
      visible: true
    }],
    [{
      id: 12,
      title: 'Storage',
      link: 'storage',
      icon: 'storage',
      status: false,
      visible: true
    }, {
      id: 13,
      title: 'Settings',
      link: 'settings',
      icon: 'settings',
      status: false,
      visible: true
    }]
  ];
  user: UserModel = this._user.fetchUser();
  userSubscription: Subscription;
  balance: BalanceModel = this._balance.fetchBalance();
  balanceSubscription: Subscription;
  completedRequests = 0;
  activeButtonIndex: number;
  headerButtonsVisible = true;
  userNavigationVisible = false;
  @ViewChild('userWrap') userWrap: ElementRef;
  hideUserNavigation(): void {
    if (this.userNavigationVisible) {
      this.userNavigationVisible = false;
    }
  }
  logout(): void {
    localStorage.clear();
    this._messages.writeSuccess('Logout successful');
    this._router.navigate(['../sign-in']);
  }
  userInit(): void {
    this._user.saveUserData({secrets: {access_token: '123', expires_in: '123', refresh_token: '123123', token_type: 'Bearer'}, image: 'http://via.placeholder.com/100x100'});
    this.userSubscription = this._user.userSubscription().subscribe(user => {
      this.user = user;
    });
    this._user.fetchProfileParams().then(() => this.completedRequests++);
  }
  balanceInit(): void {
    this.balanceSubscription = this._balance.balanceSubscription().subscribe(balance => {
      this.balance = balance;
    });
    this._balance.fetchBalanceParams().then(() => this.completedRequests++);
  }
  navigationInit(): void {
    this._user.fetchNavigationParams().then(result => {
      result.map(resultItem => {
        const navigationItem = this.navigationList.find(block => {
          return !!block.find(item => {
            return item.id === resultItem.id;
          });
        }).find(item => {
          return item.id === resultItem.id;
        });
        navigationItem['status'] = resultItem.status;
        navigationItem['visible'] = resultItem.visible;
      });
    }).then(() => this.completedRequests++);
  }
  toggleActiveButton(ix: number, ev: MouseEvent): void {
    if (ev) { ev.preventDefault(); }
    this.activeButtonIndex = this.activeButtonIndex === ix ? undefined : ix;
  }
  toggleHeaderButtons(ev: MouseEvent): void {
    if (ev) { ev.preventDefault(); }
    this.headerButtonsVisible = !this.headerButtonsVisible;
  }
  ngOnInit(): void {
    this.completedRequests = 0;
    this.userInit();
    this.balanceInit();
    this.navigationInit();
  }
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.balanceSubscription.unsubscribe();
  }
}
