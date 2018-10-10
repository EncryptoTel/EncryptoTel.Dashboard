import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {TranslateService} from '@ngx-translate/core';

import {MessageServices} from '../../services/message.services';
import {UserServices} from '../../services/user.services';
import {WsServices} from '../../services/ws.services';
import {LocalStorageServices} from '../../services/local-storage.services';
import {RefsServices} from '../../services/refs.services';
import {NavigationItemModel} from '../../models/navigation-item.model';
import {UserModel} from '../../models/user.model';
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
    constructor(public userService: UserServices,
                public _main: MainViewComponent,
                private message: MessageServices,
                private _ws: WsServices,
                private _storage: LocalStorageServices,
                private _refs: RefsServices,
                private translate: TranslateService) {
        this.user = this.userService.fetchUser();
    }
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

    get username(): string {
        if (this.user && this.user.profile) {
            let firstName = this.user.profile.firstname ? this.user.profile.firstname : '';
            let lastName = this.user.profile.lastname ? this.user.profile.lastname : '';

            let username = `${firstName} ${lastName}`;
            if (username.length > 12) {
                username =  (lastName != '') ? `${firstName} ${lastName[0]}.` : firstName;
            }
            return username;
        }
        return '';
    }

    @ViewChild('userWrap') userWrap: ElementRef;

    hideUserNavigation(): void {
        if (this.userNavigationVisible) {
            this.userNavigationVisible = false;
        }
    }

    logout(): void {
        this._refs.request.logout();
        this.message.writeSuccess('Logout successful');
    }

    userInit(): void {
        this.userSubscription = this.userService.userSubscription().subscribe(user => {
            this.user = user;
        });
        this.userService.fetchProfileParams().then(() => this.completedRequests ++);
    }

    navigationInit(): void {
        this.userService.fetchNavigationParams()
            .then(() => {
                console.log('navigation', this.userService.navigation);
            })
            .then(() => this.completedRequests ++)
            .catch();
    }

    toggleActiveButton(ix: number, ev: MouseEvent): void {
        if (ev) {
            ev.preventDefault();
        }
        this.activeButtonIndex = this.activeButtonIndex === ix ? undefined : ix;
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

    ngOnInit(): void {
        this.completedRequests = 0;
        this.userInit();
        // this.balanceInit();
        this.navigationInit();
        this.WebSocket();

        this.modulesChangedSubscription = this.userService.modulesChanged.subscribe(() => {
            this.navigationInit();
        });
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.balanceSubscription.unsubscribe();
        this.modulesChangedSubscription.unsubscribe();
    }

    useLanguage(language: string) {
        this.translate.use(language);
    }
}
