import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {MessageServices} from '../../services/message.services';
import {UserServices} from '../../services/user.services';
import {TranslateServices} from '../../services/translate.services';
import {WsServices} from '../../services/ws.services';
import {LocalStorageServices} from '../../services/local-storage.services';
import {RefsServices} from '../../services/refs.services';
import {NavigationItemModel} from '../../models/navigation-item.model';
import {UserModel} from '../../models/user.model';
import {MainViewComponent} from '../main-view.component';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {FadeAnimation} from '../../shared/fade-animation';
import {LangStateService} from '../../services/state/lang.state.service';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {ListComponent} from '@elements/pbx-list/pbx-list.component';
import {NotificationComponent} from '@components/notification/notification.component';

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

    constructor(public userService: UserServices,
                public _main: MainViewComponent,
                private message: MessageServices,
                private _ws: WsServices,
                private _storage: LocalStorageServices,
                private _translate: TranslateService,
                private _refs: RefsServices,
                private langState: LangStateService) {
        this.user = this.userService.fetchUser();
        this._user = this._storage.readItem('pbx_user');
        this.text = langState.get();
    }

    navigationList: NavigationItemModel[][];
    user: UserModel;
    userSubscription: Subscription;
    balanceSubscription: Subscription;
    serviceSubscription: Subscription;
    modulesChangedSubscription: Subscription;
    completedRequests: number = 0;
    activeButtonIndex: number;
    headerButtonsVisible: boolean = false;
    userNavigationVisible: boolean = false;
    mobileNavigationVisible: boolean = false;
    NotificationSubscription: Subscription;
    isLockedCaller: boolean = false;
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

    countUnread: number = 0;

    @ViewChild('userWrap') userWrap: ElementRef;

    hideUserNavigation(): void {
        if (this.userNavigationVisible) {
            this.userNavigationVisible = false;
        }
    }

    logout(): void {
        this._ws.close();
        this._refs.request.logout();
        this.message.writeSuccess('You have successfully logged out');
    }

    userInit(): void {
        this.userSubscription = this.userService.userSubscription().subscribe(user => {
            this.user = user;
        });
        this.userService.fetchProfileParams().then(() => this.completedRequests++);
    }

    navigationInit(): void {
        this.userService.fetchNavigationParams()
            .then((response) => {
            })
            .catch(() => {
            })
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
        const user = this._storage.readItem('pbx_user');
        return user['secrets']['access_token'];
    }

    WebSocket(): void {
        this._ws.setToken(this.getToken());
        this.balanceSubscription = this._ws.getBalance().subscribe(balance => {
            this.user.balance.balance = balance.balance;
        });
        this.serviceSubscription = this._ws.getService().subscribe(service => {
            this.navigationInit();
        });
    }

    isAdmin() {
        this._user = this._storage.readItem('pbx_user');
        if (this._user.profile) {
            if (!this._user.profile.tariffPlan) {
                return false;
            } else {
                return true;
            }
        }
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

        // this._translate.onLangChange.subscribe((event: LangChangeEvent) => {
        //     Object.keys(this.userService.navigation).forEach(item => {
        //         this.userService.navigation[item].itemTitle = this._translate.instant(this.userService.navigation[item].name);
        //     });
        // });
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.balanceSubscription.unsubscribe();
        this.modulesChangedSubscription.unsubscribe();
    }
}
