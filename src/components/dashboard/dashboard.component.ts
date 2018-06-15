import {Component} from '@angular/core';

import {DashboardModel} from '../../models/dashboard.model';
import {DashboardServices} from "../../services/dashboard.services";
import {DBHistoryServices} from '../../services/db.history.services';

import {DBHistoryModel} from '../../models/db.history.model';

@Component({
  selector: 'pbx-dashboard',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [
      DashboardServices,
      DBHistoryServices
  ]
})

export class DashboardComponent {
  constructor(private _dashboard: DashboardServices,
              private _history: DBHistoryServices) {
    this.initDashboard();
  }
  dashboard: DashboardModel;
  history: DBHistoryModel[];
  loading = true;
  fetchDashboard(): Promise<void> {
    return this._dashboard.getDashboard().then(dashboard => {
      this.dashboard = dashboard;
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }
  fetchHistory(): Promise<void> {
    return this._history.fetchHistoryList().then(history => {
          this.history = history;
      }).catch(() => {
      });
  }
  initDashboard(): void {
    this.fetchDashboard();
    this.fetchHistory();
  }
}
