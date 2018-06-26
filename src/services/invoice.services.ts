import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class InvoiceServices {
    constructor(private _req: RequestServices) {
    }

    getInvoices(): Promise<any> {
        return this._req.get('v1/order', true);
    }

}
