import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class PhoneNumbersServices {
  constructor(private _req: RequestServices) {}

  getPhoneNumbersList(requestDetails: any): Promise<any> {
    return this._req.get(`v1/sip/outers?page=${requestDetails.page}&limit=${requestDetails.limit}&search=${requestDetails.search && encodeURI(requestDetails.search)}`, true);
  }

  removePhoneNumber(id): Promise<any> {
    return this._req.del(`v1/sip/outers/${id}`, true);
  }

  toggleNumber(id, status): Promise<any> {
    return this._req.put(`v1/sip/outers/${id}/status`, {enable: status}, true);
  }

  buyNumber(id): Promise<any> {
    return this._req.post(`v1/order/number/${id}`, {}, true);
  }

  getAvailableNumbersList(requestDetails: any): Promise<any> {
    return this._req.get(`v1/number?page=${requestDetails.page}&limit=${requestDetails.limit}&search=${requestDetails.search && encodeURI(requestDetails.search)}`, true);
  }
}
