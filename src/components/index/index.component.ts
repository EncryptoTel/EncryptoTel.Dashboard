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
import {FormMessageModel} from '../../models/form-message.model';

@Component({
    selector: 'pbx-index',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms'), FadeAnimation('100ms')]
})

export class IndexComponent implements OnInit, OnDestroy {
    constructor (private _user: UserServices,
                private _messages: MessageServices,
                private _router: Router,
                public _main: MainViewComponent,
                private _ws: WsServices,
                private _storage: LocalStorageServices) {
    }

    navigationList: NavigationItemModel[][];
    user: UserModel = this._user.fetchUser();
    userSubscription: Subscription;
    // balance: BalanceModel = this._balance.fetchBalance();
    balanceSubscription: Subscription;
    serviceSubscription: Subscription;
    completedRequests = 0;
    activeButtonIndex: number;
    headerButtonsVisible = true;
    userNavigationVisible = false;
    mobileNavigationVisible = false;
    mobileUserVisible = false;

    errorsSubscription: Subscription;
    message: any;

    notificator: {
      visible: boolean,
      type: string,
      message: string,
      actionName: string
    };


    @ViewChild('userWrap') userWrap: ElementRef;

    hideUserNavigation(): void {
        if (this.userNavigationVisible) {
            this.userNavigationVisible = false;
        }
    }

    logout(): void {
        this._storage.clearItem('pbx_user');
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

    ngOnInit() {

        this.completedRequests = 0;
        this.userInit();
        // this.balanceInit();
        this.navigationInit();
        this.WebSocket();

        this.message = this._messages.messagesList().subscribe( mes => {
          console.log(mes[0]);
            if (mes[0]) {
              this.notificator = {
                visible: true,
                type: mes[0].type,
                message: mes[0].text,
                actionName: 'Got it'
              };
              // this.notificator.visible = true;
              // this.notificator.type = mes[0].type;
              // this.notificator.message = mes[0].text;
              this.notificator = Object.assign({}, this.notificator);
            }
        });

        // this._messages.messagesList().subscribe(messages => {
        //   console.log(messages[0]);
        //     if (messages[0]) {
        //       this.notificator.visible = true;
        //       this.notificator.type = messages[0].type;
        //       this.notificator.message = messages[0].text;
        //       this.notificator = Object.assign({}, this.notificator);
        //     }
        // });

        // this._messages.messagesList().subscribe(messages => {
        //   console.log(messages);
        //   if (messages[0]) {
        //     this.notificator.visible = true;
        //     this.notificator.type = messages[0].type;
        //     this.notificator.message = messages[0].text;
        //     this.notificator = Object.assign({}, this.notificator);
        //   }
        // });
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.balanceSubscription.unsubscribe();
    }
}
