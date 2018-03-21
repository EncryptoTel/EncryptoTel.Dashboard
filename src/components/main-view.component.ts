import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {MessageServices} from '../services/message.services';

import {MessageModel} from '../models/message.model';

import {FadeAnimation} from '../shared/fade-animation';
import {ListServices} from '../services/list.services';

@Component({
  selector: 'main-view',
  template: '<router-outlet></router-outlet>',
  animations: [FadeAnimation('300ms')]
})

export class MainViewComponent implements OnInit, OnDestroy {
  constructor(public _services: MessageServices,
              private _list: ListServices,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private title: Title) {}
  messagesList: MessageModel[];
  routerSubscription: Subscription;
  public pageTitle = 'Encrypto Telecom';
  @HostBinding('class') public userTheme: string;
  public setUserTheme(theme: string) {
    this.userTheme = theme;
  }
  initLists(): void {
    this._list.fetchCountriesList();
    this._list.fetchCurrenciesList();
  }
  ngOnInit(): void {
    this.setUserTheme('dark_theme');
    this.initLists();
    this._services.messagesList().subscribe(messages => {
      this.messagesList = messages;
    });
    this.routerSubscription = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map((route) => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      })
      .filter((route) => route.outlet === 'primary')
      .mergeMap((route) => route.data)
      .subscribe((event) => {
        this.pageTitle = event['title'];
        this.title.setTitle(`Encrypto Telecom | ${event['title']}`);
      });
  }
  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}
