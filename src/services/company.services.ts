import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class CompanyServices {
  constructor(private _req: RequestServices) {}

  getTypes(): void {
    this._req.get('v1/handbooks/company/get-types', true)
      .then(res => console.log(res))
      .catch(res => console.log(res));
  }

  getCountries(): Promise<any> {
    return this._req.get(`v1/countries`, true);
  }

  save(formData): Promise<any> {
    return this._req.post(`v1/company`, formData, true);
  }
  getCompany(): Promise<any> {
    return this._req.get(`v1/company`, true);
  }
}
