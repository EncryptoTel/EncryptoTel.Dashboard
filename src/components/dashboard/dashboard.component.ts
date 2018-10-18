import {Component} from '@angular/core';

import {CallDetailItem, CallDetailModel, DashboardModel} from '../../models/dashboard.model';
import {DashboardServices} from '../../services/dashboard.services';

import {Subscription} from 'rxjs/Subscription';
import {WsServices} from '../../services/ws.services';

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
    cdrSubscription: Subscription;

    fetchDashboard(item = null) {
        (item ? item : this).loading = true;
        this._dashboard.getDashboard().then(dashboard => {
            this.dashboard = dashboard;
            (item ? item : this).loading = false;
        }).catch(() => {
            (item ? item : this).loading = false;
        });
    }

    initDashboard(): void {
        this.fetchDashboard();

        this.balanceSubscription = this._ws.getBalance().subscribe(balance => {
            this.dashboard.balance.value = balance.balance;
        });
        this.cdrSubscription = this._ws.subCdr().subscribe(() => {
            let model = null;
            if (this.dashboard.callDetail.length > 0) {
                model = this.dashboard.callDetail[0];
            }
            if (!model) {
                model = new CallDetailModel();
                model.date = new Date();
                this.dashboard.callDetail.unshift(model);
            }
            let item = new CallDetailItem();
            model.list.unshift(item);
            this.fetchDashboard(item);
        });
    }
}
