import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { MessageServices } from '@services/message.services';
import { UserServices } from '@services/user.services';
import { WsServices } from '@services/ws.services';
import { LocalStorageServices } from '@services/local-storage.services';
import { RefsServices } from '@services/refs.services';
import { LangStateService } from '@services/state/lang.state.service';
import { NavigationItemModel } from '@models/navigation-item.model';
import { UserModel } from '@models/user.model';
import { MainViewComponent } from '@components/main-view.component';
import { SwipeAnimation } from '@shared/swipe-animation';
import { FadeAnimation } from '@shared/fade-animation';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { ContactState } from '@services/state/contact.service';
import { GoogleAnalyticsEventsService } from '@services/google-analytics-events.service';


@Component({
  selector: 'pbx-index',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '200ms'), FadeAnimation('100ms')]
})

export class IndexComponent implements OnInit, OnDestroy {

  language: string;
  text: any;
  _user: any;
  menu: any;
  version: string;

  navigationList: NavigationItemModel[][];
  user: UserModel;
  userSubscription: Subscription;
  balanceSubscription: Subscription;
  serviceSubscription: Subscription;
  modulesChangedSubscription: Subscription;
  completedRequests: number = 0;
  activeButtonIndex: number;
  headerButtonsVisible: boolean = true;
  userNavigationVisible: boolean = false;
  mobileNavigationVisible: boolean = false;
  NotificationSubscription: Subscription;
  isLockedCaller: boolean = true;

  countUnread: number = 0;

  @ViewChild('userWrap') userWrap: ElementRef;

  constructor(
    public userService: UserServices,
    public main: MainViewComponent,
    private message: MessageServices,
    private ws: WsServices,
    private storage: LocalStorageServices,
    private translate: TranslateService,
    private refs: RefsServices,
    private langState: LangStateService,
    private router: Router,
    private contactState: ContactState,
    private gaService: GoogleAnalyticsEventsService
  ) {
    this.user = this.userService.fetchUser();
    this._user = this.storage.readItem('pbx_user');
    this.text = langState.get();
    this.version = environment.version;
  }

  ngOnInit(): void {
    this.completedRequests = 0;
    this.userInit();
    // this.balanceInit();
    this.navigationInit();
    this.WebSocket();

    this.modulesChangedSubscription = this.userService.modulesChanged.subscribe(() => {
      this.navigationInit();
    });
    this.menu = {
      'Refill balance': this.translate.instant('Refill balance'),
      'Tariff plan': this.translate.instant('Tariff plan'),
    };
    // this._translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //     Object.keys(this.userService.navigation).forEach(item => {
    //         this.userService.navigation[item].itemTitle = this._translate.instant(this.userService.navigation[item].name);
    //     });
    // });
    this.contactState.change.subscribe(value => {
      if (value.state) {
        this.activeButtonIndex = undefined;
        this.router.navigateByUrl('/cabinet/address-book/create');
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.balanceSubscription.unsubscribe();
    this.modulesChangedSubscription.unsubscribe();
  }

  get username(): string {
    if (this.user && this.user.profile) {
      let firstName: string;
      firstName = this.user.profile.firstname ? this.user.profile.firstname : '';
      let lastName: string;
      lastName = this.user.profile.lastname ? this.user.profile.lastname : '';

      let username = `${firstName} ${lastName}`;
      if (username.length > 12) {
        username = (lastName !== '') ? `${firstName} ${lastName[0]}.` : firstName;
      }
      return username;
    }
    return '';
  }

  hideUserNavigation(): void {
    if (this.userNavigationVisible) {
      this.userNavigationVisible = false;
    }
  }

  logout(): void {
    this.router.navigateByUrl('/logout');
  }

  userInit(): void {
    this.userSubscription = this.userService.userSubscription()
      .subscribe(user => {
        this.user = user;
      });
    this.userService.fetchProfileParams()
      .then(() => {
        const user = this.userService.fetchUser();
        const userId: string = user ? user.profile.email : null;
        console.log('login', user);
        this.gaService.emitEvent('login', 'login', userId);
        this.completedRequests++;
      });
  }

  navigationInit(): void {
    this.userService.fetchNavigationParams()
      .then(() => { })
      .catch(() => { })
      .then(() => this.completedRequests++);
  }

  toggleActiveButton(ix: number, ev: MouseEvent): void {
    if (!this.isLockedCaller) {
      if (ev) {
        ev.preventDefault();
      }
      this.activeButtonIndex = this.activeButtonIndex === ix ? undefined : ix;
    }
  }

  toggleHeaderButtons(ev: MouseEvent): void {
    if (ev) {
      ev.preventDefault();
    }
    this.headerButtonsVisible = !this.headerButtonsVisible;
  }

  getToken(): string {
    const user = this.storage.readItem('pbx_user');
    return user['secrets']['access_token'];
  }

  WebSocket(): void {
    this.ws.setToken(this.getToken());
    this.balanceSubscription = this.ws.getBalance().subscribe(balance => {
      this.user.balance.balance = balance.balance;
    });
    this.serviceSubscription = this.ws.getService().subscribe(service => {
      this.navigationInit();
    });
  }

  isAdmin(): boolean {
    this._user = this.storage.readItem('pbx_user');
    if (this._user && this._user.profile) {
      if (!this._user.profile.tariffPlan) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
}
