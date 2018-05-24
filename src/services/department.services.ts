import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';


@Injectable()
export class DepartmentServices {
  constructor(private _req: RequestServices) {
  }

  getDepartments(): Promise<any> {
    return this._req.get(`v1/department`, true);
  }
}
