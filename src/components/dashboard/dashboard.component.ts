import {Component} from '@angular/core';

import {BalanceServices} from '../../services/balance.services';
import {DBTariffPlanServices} from '../../services/db.tariff-plan.services';
import {DriveServices} from '../../services/drive.services';
import {DBPhoneNumbersServices} from '../../services/db.phone-numbers.services';
import {DBHistoryServices} from '../../services/db.history.services';

import {BalanceModel} from '../../models/balance.model';
import {DBTariffPlanModel} from '../../models/db.tariff-plan.model';
import {DriveModel} from '../../models/drive.model';
import {DBPhoneNumberModel} from '../../models/db.phone-number.model';
import {DBHistoryModel} from '../../models/db.history.model';

@Component({
  selector: 'pbx-dashboard',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [
    DBTariffPlanServices,
    DBPhoneNumbersServices,
    DBHistoryServices
  ]
})

export class DashboardComponent {
  constructor(private _balance: BalanceServices,
              private _tariff: DBTariffPlanServices,
              private _drive: DriveServices,
              private _numbers: DBPhoneNumbersServices,
              private _history: DBHistoryServices) {
    this.initDashboard();
  }
  balance: BalanceModel;
  tariff: DBTariffPlanModel;
  drive: DriveModel;
  phone_numbers: DBPhoneNumberModel[];
  history: DBHistoryModel[];
  loading = {
    balance: true,
    tariff: true,
    phone_numbers: true,
    drive: true,
    history: true,
    diagram: true
  };
  fetchBalance(): Promise<void> {
    return this._balance.fetchBalanceParams().then(balance => {
      this.balance = balance;
      this.loading.balance = false;
    }).catch(() => {
      this.loading.balance = false;
    });
  }
  fetchTariffPlan(): Promise<void> {
    return this._tariff.fetchTariffPlanDetails().then(tariff => {
      this.tariff = tariff;
      this.loading.tariff = false;
    }).catch(() => {
      this.loading.tariff = false;
    });
  }
  fetchStorage(): Promise<void> {
    return this._drive.fetchStorageParams().then(drive => {
      this.drive = drive;
      this.loading.drive = false;
    }).catch(() => {
      this.loading.drive = false;
    });
  }
  fetchNumbers(): Promise<void> {
    return this._numbers.fetchNumbersList().then(numbers => {
      this.phone_numbers = numbers;
      this.loading.phone_numbers = false;
    }).catch(() => {
      this.loading.phone_numbers = false;
    });
  }
  fetchHistory(): Promise<void> {
    return this._history.fetchHistoryList().then(history => {
      this.history = history;
      this.loading.history = false;
    }).catch(() => {
      this.loading.history = false;
    });
  }
  initDashboard(): void {
    this.fetchBalance().then(() => {
      this.fetchTariffPlan().then(() => {
        this.fetchNumbers().then(() => {
          this.fetchStorage().then(() => {
            this.fetchHistory();
          });
        });
      });
    });
  }
}
