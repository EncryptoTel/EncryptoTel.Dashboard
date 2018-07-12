import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class InvoiceServices {
    constructor(private _req: RequestServices) {
    }

  getInvoices(pageinfo, sort: string, sortDirection: string): Promise<any> {
    let url = `v1/invoice?page=${pageinfo.page}&limit=${pageinfo.limit}`;
    if (sort) {
      url = url + `&sort[${sort}]=${sortDirection}`;
    }
    return this._req.get(url);
  }

}
