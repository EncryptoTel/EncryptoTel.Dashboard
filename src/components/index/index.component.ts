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
import {ListServices} from '../../services/list.services';

@Component({
    selector: 'pbx-index',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms'), FadeAnimation('100ms')]
})

export class IndexComponent implements OnInit, OnDestroy {
    constructor(private _user: UserServices,
                // private _balance: BalanceServices,
                private _messages: MessageServices,
                private _router: Router,
                private _list: ListServices,
                public _main: MainViewComponent) {
    }

    navigationList: NavigationItemModel[][];
    user: UserModel = this._user.fetchUser();
    userSubscription: Subscription;
    // balance: BalanceModel = this._balance.fetchBalance();
    balanceSubscription: Subscription;
    completedRequests = 0;
    activeButtonIndex: number;
    headerButtonsVisible = true;
    userNavigationVisible = false;
    mobileNavigationVisible = false;
    mobileUserVisible = false;
    @ViewChild('userWrap') userWrap: ElementRef;

    initLists(): Promise<any> {
        return Promise.all([this._list.fetchCurrenciesList(), this._list.fetchCountriesList()]);
    }

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
            this.navigationList = result;
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
        }).then(() => this.completedRequests++);
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

    ngOnInit(): void {
        this.completedRequests = 0;
        this.initLists().then(() => {
            this.userInit();
            // this.balanceInit();
            this.navigationInit();
        });
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.balanceSubscription.unsubscribe();
    }
}
