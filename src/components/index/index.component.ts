import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {MessageServices} from '../../services/message.services';
import {UserServices} from '../../services/user.services';

import {NavigationItemModel} from '../../models/navigation-item.model';
import {UserModel} from '../../models/user.model';
import {MainViewComponent} from '../main-view.component';

import {SwipeAnimation} from '../../shared/swipe-animation';
import {FadeAnimation} from '../../shared/fade-animation';
import {WsServices} from '../../services/ws.services';
import {LocalStorageServices} from '../../services/local-storage.services';
import {RefsServices} from '../../services/refs.services';

@Component({
    selector: 'pbx-index',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms'), FadeAnimation('100ms')]
})

export class IndexComponent implements OnInit, OnDestroy {
    constructor(public _user: UserServices,
                private _message: MessageServices,
                private _router: Router,
                public _main: MainViewComponent,
                private _ws: WsServices,
                private _storage: LocalStorageServices,
                private _refs: RefsServices) {
    }

    navigationList: NavigationItemModel[][];
    user: UserModel = this._user.fetchUser();
    userSubscription: Subscription;
    balanceSubscription: Subscription;
    serviceSubscription: Subscription;
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
        this._message.writeSuccess('Logout successful');
    }

    userInit(): void {
        this.userSubscription = this._user.userSubscription().subscribe(user => {
            this.user = user;
        });
        this._user.fetchProfileParams().then(() => this.completedRequests++);
    }

    // balanceInit(): void {
    //   this.balanceSubscription = this._balance.balanceSubscription().subscribe(balance => {
    //     this.balance = balance;
    //   });
    //   this._balance.fetchBalanceParams().then(() => this.completedRequests++);
    // }

    navigationInit(): void {
        this._user.fetchNavigationParams().then(result => {
            // this.navigationList = result;

            // result.map(resultItem => {
            //   const navigationItem = this.navigationList.find(block => {
            //     return !!block.find(item => {
            //       return item.id === resultItem.id;
            //     });
            //   }).find(item => {
            //     return item.id === resultItem.id;
            //   });
            //   navigationItem['status'] = resultItem.status;
            //   navigationItem['visible'] = resultItem.visible;
            // });
        }).then(() => this.completedRequests++).catch();
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
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.balanceSubscription.unsubscribe();
    }
}
