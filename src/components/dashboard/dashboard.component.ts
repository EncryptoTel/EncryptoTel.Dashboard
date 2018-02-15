import {Component, OnInit} from '@angular/core';

import {DBHistoryServices} from '../../services/db.history.services';
import {DBPhoneNumbersServices} from '../../services/db.phone-numbers.services';
import {DBTariffPlanServices} from '../../services/db.tariff-plan.services';
import {DriveServices} from '../../services/drive.services';
import {BalanceServices} from '../../services/balance.services';

import {DBHistoryModel} from '../../models/db.history.model';
import {DBPhoneNumberModel} from '../../models/db.phone-number.model';
import {DBTariffPlanModel} from '../../models/db.tariff-plan.model';
import {DriveModel} from '../../models/drive.model';
import {BalanceModel} from '../../models/balance.model';

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

export class DashboardComponent implements OnInit {
  constructor(private _balance: BalanceServices,
              private _tariff: DBTariffPlanServices,
              private _drive: DriveServices,
              private _numbers: DBPhoneNumbersServices,
              private _history: DBHistoryServices) {}
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
  initDashboard(): void {
    this._balance.fetchBalanceParams().then(balance => {
      this.balance = balance;
      this.loading.balance = false;
      return Promise.resolve(null);
    }).catch(() => this.loading.balance = false);
    this._tariff.fetchTariffPlanDetails().then(tariff => {
      this.tariff = tariff;
      this.loading.tariff = false;
      return Promise.resolve(null);
    }).catch(() => this.loading.tariff = false);
    this._drive.fetchStorageParams().then(drive => {
      this.drive = drive;
      this.loading.drive = false;
      return Promise.resolve(null);
    });
    this._numbers.fetchNumbersList().then(numbers => {
      this.phone_numbers = numbers;
      this.loading.phone_numbers = false;
      return Promise.resolve(null);
    });
    this._history.fetchHistoryList().then(history => {
      this.history = history;
      this.loading.history = false;
      return Promise.resolve(null);
    });
  }
  ngOnInit() {
    this.initDashboard();
  }
}
