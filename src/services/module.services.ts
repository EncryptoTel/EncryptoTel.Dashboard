import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class ModuleServices {
    constructor(private _req: RequestServices) {
    }

    getModulesList(): Promise<any> {
        return this._req.get('v1/service/account');
    }

    buyService(id: number): Promise<any> {
        return this._req.post(`v1/order/service/${id}`, {});
    }

    returnModule(id: number) {
        return this._req.del(`v1/order/service/${id}`);
    }

}
