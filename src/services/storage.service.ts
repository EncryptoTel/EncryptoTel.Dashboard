import {BaseService} from "./base.service";
import {RequestServices} from './request.services';
import {Injectable} from '@angular/core';

@Injectable()

export class StorageService  {
  constructor(
    private _req: RequestServices
  ) {}

  /*uploadFile(data: FormData): Promise<any> {
      return this.rawRequest('POST', '', data);
  }*/

  getList(pageInfo: any, type: string): Promise<any> {
    return this._req.get(`v1/account/file?limit=${pageInfo.limit}&page=${pageInfo.page}&type=${type}`, true);
  }

  getTypes(): Promise<any> {
    return this._req.get('v1/handbooks/account/file/get-types', true);
  }

  /*getList(): Promise<any> {
      return this.get('');
  }*/

  /*onInit() {
      this.url = 'v1/account/file';
  }*/

}
