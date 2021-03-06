import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CallDetailItem, CallDetailModel, DashboardModel } from '@models/dashboard.model';
import { DashboardServices } from '@services/dashboard.services';
import { WsServices } from '@services/ws.services';
import { LocalStorageServices } from '@services/local-storage.services';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'pbx-dashboard',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [
    DashboardServices,
  ]
})
export class DashboardComponent {

  user: any;
  dateFormat: any;

  dashboard: DashboardModel;
  loading = true;
  balanceSubscription: Subscription;
  cdrSubscription: Subscription;

  constructor(
    private _dashboard: DashboardServices,
    private _ws: WsServices,
    private storage: LocalStorageServices,
    private translation: TranslateService
  ) {
    this.initDashboard();
    this.user = this.storage.readItem('pbx_user');
    this.dateFormat = this.storage.readItem('dateFormat');
  }

  fetchDashboard(item = null) {
    (item ? item : this).loading = true;
    this._dashboard.getDashboard()
      .then(dashboard => {
        this.dashboard = dashboard;
        this.translateCallDetailsTimes();
        (item ? item : this).loading = false;
      }).catch((error) => {
        console.log('catch fetchDashboard', error);
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
      const item = new CallDetailItem();
      model.list.unshift(item);
      this.fetchDashboard(item);
    });
  }

  translateCallDetailsTimes(): void {
    if (!this.dashboard || !this.dashboard.callDetail) { return; }

    const abbreviations: string[] = this.translation
      .instant('timeAbbreviation')
      .split('|');
    this.dashboard.callDetail.forEach(detail => {
      detail.list.forEach(item => {
        item.abbreviations = abbreviations;
      });
    });
  }

  isAdmin() {
    if (!this.user.profile.tariffPlan) {
      return false;
    } else {
      return true;
    }
  }
}
