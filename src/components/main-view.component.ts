import { Component, HostBinding, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { } from '@types/google.analytics';

import { MessageServices } from '@services/message.services';
import { LocalStorageServices } from '@services/local-storage.services';
import { FadeAnimation } from '@shared/fade-animation';
import { PbxTranslateLoader } from '@shared/pbx-translate-loader';
import { UserServices } from '@services/user.services';
import { UserModel } from '@models/user.model';


// first and second
// import * as $ from 'jquery';
// declare var jquery:any;
// declare var $ :any;

@Component({
  selector: 'main-view',
  template: `
        <pbx-loader *ngIf="loading"></pbx-loader>
        <router-outlet *ngIf="!loading"></router-outlet>
        <pbx-notificator></pbx-notificator>
    `,
  animations: [FadeAnimation('300ms')]
})
export class MainViewComponent implements OnInit, OnDestroy {

  // messagesList: MessageModel[];
  routerSubscription: Subscription;
  loading: boolean = false;

  pageTitle: string = 'Encrypto Telecom';
  @HostBinding('class') public userTheme: string;

  // -- component lifecycle methods -----------------------------------------

  constructor(
    public services: MessageServices,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    private storage: LocalStorageServices,
    private cookieService: CookieService,
    private translate: TranslateService,
    private userService: UserServices) {

    (<PbxTranslateLoader>this.translate.currentLoader).loadTranslations().then(() => {
      translate.setDefaultLang('en');
      let language: string = this.storage.readItem('user_lang');
      if (!language) {
        language = 'en';
      }
      translate.use(language);
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        const user: UserModel = this.userService.fetchUser();
        if (user) {
          ga('set', 'userId', user.profile.email);
        }
        ga('send', 'pageview');
        console.log('ga-send', event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    let theme: string;
    theme = this.storage.readItem('pbx_theme');
    if (!theme) {
      theme = 'dark_theme';
    }
    this.setUserTheme(theme);
    this.routerSubscription = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
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

  // -- component methods ---------------------------------------------------

  public setUserTheme(theme: string) {
    this.userTheme = theme;
    document.body.removeAttribute('class');
    document.body.classList.add(theme);
    this.cookieService.set('pbx_theme', theme);
    this.storage.writeItem('pbx_theme', theme);
  }
}


