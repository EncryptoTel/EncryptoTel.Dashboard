import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {LocalStorageServices} from './local-storage.services';

import {TariffPlanModel} from '../models/tariff-plan.model';
import {plainToClass} from 'class-transformer';

@Injectable()
export class TariffPlanServices {
    constructor(private _req: RequestServices) {
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
