import {Component, OnInit} from '@angular/core';
import {BalanceServices} from '../../services/balance.services';
import {BalanceModel} from '../../models/balance.model';
import {DBTariffPlanServices} from '../../services/db.tariff-plan.services';
import {DBTariffPlanModel} from '../../models/db.tariff-plan.model';
import {DriveServices} from '../../services/drive.services';
import {DriveModel} from '../../models/drive.model';

@Component({
  selector: 'pbx-dashboard',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class DashboardComponent implements OnInit {
  constructor(private _balance: BalanceServices,
              private _tariff: DBTariffPlanServices,
              private _drive: DriveServices) {}
  balance: BalanceModel;
  tariff: DBTariffPlanModel;
  drive: DriveModel;
  loading = {
    balance: true,
    tariff: true,
    phone_numbers: true,
    drive: true,
    history: true
  };
  initDashboard() {
    this._balance.fetchBalanceParams().then(balance => {
      this.balance = balance;
      this.loading.balance = false;
    }).catch(() => this.loading.balance = false);
    this._tariff.fetchTariffPlanDetails().then(tariff => {
      this.tariff = tariff;
      this.loading.tariff = false;
    }).catch(() => this.loading.tariff = false);
    this._drive.fetchStorageParams().then(drive => {
      this.drive = drive;
      this.loading.drive = false;
    });
  }
  ngOnInit() {
    this.initDashboard();
  }
}
