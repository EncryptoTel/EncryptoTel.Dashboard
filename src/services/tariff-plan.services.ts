import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class TariffPlanServices {
    constructor(private _req: RequestServices) {
    }

    /*
      Getting tariff plans list
     */
    getTariffPlans(): Promise<any> {
        return this._req.get('v1/tariff-plan/account');
    }

    /*
      Tariff plan select
     */
    selectTariffPlan(id: number): Promise<any> {
        return this._req.post(`v1/order/tariff-plan/${id}`, {});
    }
}
