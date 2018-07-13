import {Component} from '@angular/core';

import {DashboardModel} from '../../models/dashboard.model';
import {DashboardServices} from "../../services/dashboard.services";

import {Subscription} from "rxjs/Subscription";
import {WsServices} from "../../services/ws.services";

@Component({
    selector: 'pbx-dashboard',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [
        DashboardServices,
    ]
})

export class DashboardComponent {
    constructor(private _dashboard: DashboardServices,
                private _ws: WsServices) {
        this.initDashboard();
    }

    dashboard: DashboardModel;
    loading = true;
    balanceSubscription: Subscription;

    fetchDashboard(): Promise<void> {
        return this._dashboard.getDashboard().then(dashboard => {
            this.dashboard = dashboard;
            this.dashboard.storage.availableSize = Math.round((this.dashboard.storage.totalSize - this.dashboard.storage.usedSize) * 100) / 100;
            this.loading = false;
        }).catch(() => {
            this.loading = false;
        });
    }

    initDashboard(): void {
        this.fetchDashboard();

        this.balanceSubscription = this._ws.getBalance().subscribe(balance => {
            this.dashboard.balance.value = balance.balance;
            // console.log('dashboard balance');
        });
    }
}
