import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class InvoiceServices {
    constructor(private _req: RequestServices) {
    }

    getInvoices(page: number, sort: string, sortDirection: string): Promise<any> {
        let url = `v1/invoice?page=${page}&limit=3`;
        if (sort) {
            url = url + `&sort[${sort}]=${sortDirection}`;
        }
        return this._req.get(url, true);
    }

}
