import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class CompanyServices {
  constructor(private _req: RequestServices) {}

  getCountries(): Promise<any> {
    return this._req.get(`v1/countries`);
  }

  save(formData): Promise<any> {
    return this._req.post(`v1/company`, formData);
  }
  getCompany(): Promise<any> {
    return this._req.get(`v1/company`);
  }
}
