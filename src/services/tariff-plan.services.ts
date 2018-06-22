import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {StorageServices} from './storage.services';

import {TariffPlanModel} from '../models/tariff-plan.model';
import {plainToClass} from 'class-transformer';

@Injectable()
export class TariffPlanServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices) {}
  tariffPlan: TariffPlanModel;
  subscription: Subject<TariffPlanModel> = new Subject<TariffPlanModel>();
  /*
    Fetch account tariff params
   */
  fetchTariffPlanDetails(): Promise<TariffPlanModel> {
    return this._req.get('db_tariff.json').then(res => {
      this.tariffPlan = plainToClass(TariffPlanModel, res['tariff'] as Object);
      this._storage.writeItem('pbx_tariff', this.tariffPlan);
      this.touchTariff();
      return Promise.resolve(this.tariffPlan);
    });
  }
  /*
    Fetch if tariff exist in storage
   */
  fetchTariff = (): TariffPlanModel | null => {
    if (this._storage.readItem('pbx_tariff')) {
      return plainToClass(TariffPlanModel, this._storage.readItem('pbx_tariff') as Object);
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
  tariffPlanSubscription(): Observable<TariffPlanModel> {
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
    return this._req.post(`v1/order/tariff-plan/${id}`, {}, true);
  }
}
