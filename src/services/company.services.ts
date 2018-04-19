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
}
