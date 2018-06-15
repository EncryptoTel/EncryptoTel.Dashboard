import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';


@Injectable()
export class DashboardServices {
  constructor(private _req: RequestServices) {
  }

  getDashboard(): Promise<any> {
    return this._req.get(`v1/dashboard`, true);
  }

}
