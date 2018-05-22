import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {StorageServices} from './storage.services';

import {DBTariffPlanModel} from '../models/db.tariff-plan.model';
import {plainToClass} from 'class-transformer';

@Injectable()
export class DBTariffPlanServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices) {}
  tariffPlan: DBTariffPlanModel;
  subscription: Subject<DBTariffPlanModel> = new Subject<DBTariffPlanModel>();
  /*
    Fetch account tariff params
   */
  fetchTariffPlanDetails(): Promise<DBTariffPlanModel> {
    return this._req.get('db_tariff.json').then(res => {
      this.tariffPlan = plainToClass(DBTariffPlanModel, res['tariff'] as Object);
      this._storage.writeItem('pbx_tariff', this.tariffPlan);
      this.touchTariff();
      return Promise.resolve(this.tariffPlan);
    });
  }
  /*
    Fetch if tariff exist in storage
   */
  fetchTariff = (): DBTariffPlanModel | null => {
    if (this._storage.readItem('pbx_tariff')) {
      return plainToClass(DBTariffPlanModel, this._storage.readItem('pbx_tariff') as Object);
    } else {
      return null;
    }
  }
  /*
    Refresh tariff subscription
   */
  touchTariff(): void {
    this.tariffPlan = this.fetchTariff();
    this.subscription.next(this.tariffPlan);
  }
  /*
    Tariff plan subscription
   */
  tariffPlanSubscription(): Observable<DBTariffPlanModel> {
    return this.subscription.asObservable();
  }
  /*
    Getting tariff plans list
   */
  getTariffPlans(): Promise<any> {
    return this._req.get('v1/tariff-plan/account', true);
  }
  /*
    Tariff plan select
   */
  selectTariffPlan(id: number): Promise<any> {
    return this._req.get(`v1/tariff-plan/${id}`, true);
  }
}
