import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {StorageServices} from './storage.services';

import {DBTariffPlanModel} from '../models/db.tariff-plan.model';

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
      this.tariffPlan = res['tariff'];
      this._storage.writeItem('pbx_tariff', this.tariffPlan);
      this.touchTariff();
      return Promise.resolve(res);
    });
  }
  /*
    Fetch if tariff exist in storage
   */
  fetchTariff = (): DBTariffPlanModel => {
    return this._storage.readItem('pbx_tariff');
  }
  /*
    Refresh tariff subscription
   */
  touchTariff(): void {
    this.tariffPlan = this._storage.readItem('pbx_tariff');
    this.subscription.next(this.tariffPlan);
  }
  /*
    Tariff plan subscription
   */
  tariffPlanSubscription(): Observable<DBTariffPlanModel> {
    return this.subscription.asObservable();
  }
}
