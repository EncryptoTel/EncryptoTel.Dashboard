import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';

import { MessageServices } from '@services/message.services';
import { LocalStorageServices } from '@services/local-storage.services';
import { FadeAnimation } from '@shared/fade-animation';
import { PbxTranslateLoader } from '@shared/pbx-translate-loader';
import { ConnectionService } from '@services/connectionService';


@Component({
  selector: 'main-view',
  template: `
        <pbx-loader *ngIf="loading"></pbx-loader>
        <router-outlet *ngIf="!loading"></router-outlet>
        <pbx-notificator></pbx-notificator>
        <div *ngIf="connectionLost" class="no-internet">No Internet connnection</div>
    `,
  styles: [`
    .no-internet {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      text-align: center;
      background: #c10000;
      z-index: 100;
      font-size: 18px;
      padding: 20px;
    }
  `],
  animations: [FadeAnimation('300ms')]
})
export class MainViewComponent implements OnInit, OnDestroy {

  // messagesList: MessageModel[];
  routerSubscription: Subscription;
  connectionLostSubs: Subscription;
  
  loading: boolean = false;
  pingTimer: any = null;
  connectionLost: boolean = false;

  pageTitle: string = 'Encrypto Telecom';
  @HostBinding('class') public userTheme: string;

  // -- component lifecycle methods -----------------------------------------

  constructor(
    public message: MessageServices,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    private storage: LocalStorageServices,
    private cookieService: CookieService,
    private translate: TranslateService,
    private connectionService: ConnectionService,

  ) {
    (<PbxTranslateLoader>this.translate.currentLoader).loadTranslations().then(() => {
      translate.setDefaultLang('en');
      let language: string = this.storage.readItem('user_lang');
      if (!language) {
        language = 'en';
      }
      translate.use(language);
    });
  }

  ngOnInit(): void {
    let theme: string = this.storage.readItem('pbx_theme');
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

    this.connectionLostSubs = this.connectionService.availebleConnection.subscribe((res) => {
      this.connectionLost = res;
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.connectionLostSubs.unsubscribe();
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }
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


