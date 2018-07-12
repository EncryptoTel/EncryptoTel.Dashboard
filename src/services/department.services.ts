import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';


@Injectable()
export class DepartmentServices {
  constructor(private _req: RequestServices) {
  }

  getDepartments(): Promise<any> {
    return this._req.get(`v1/department`);
  }

  saveDepartment(department): Promise<any> {
    return this._req.post(`v1/department`, department);
  }

  editDepartment(id: number, department): Promise<any> {
    return this._req.put(`v1/department/${id}`, department);
  }

  deleteDepartment(id: number): Promise<any> {
    return this._req.del(`v1/department/${id}`);
  }
}
