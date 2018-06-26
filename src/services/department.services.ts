import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';


@Injectable()
export class DepartmentServices {
  constructor(private _req: RequestServices) {
  }

  getDepartments(): Promise<any> {
    return this._req.get(`v1/department`, true);
  }

  getSipOuters(): Promise<any> {
    return this._req.get(`v1/sip/outers`, true);
  }

  saveDepartment(department): Promise<any> {
    return this._req.post(`v1/department`, department, true);
  }

  editDepartment(id: number, department): Promise<any> {
    return this._req.put(`v1/department/${id}`, department, true);
  }

  deleteDepartment(id: number): Promise<any> {
    return this._req.del(`v1/department/${id}`, true);
  }
}
