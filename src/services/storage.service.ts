import {BaseService} from "./base.service";
import {RequestServices} from './request.services';
import {Injectable} from '@angular/core';

@Injectable()

export class StorageService extends BaseService {

    uploadFile(data: FormData): Promise<any> {
        return this.rawRequest('POST', '', data);
    }

    getList(pageInfo: any, type: string, search: string): Promise<any> {
        let url = `?limit=${pageInfo.limit}&page=${pageInfo.page}`;
        if (type) url += `&type=${type}`;
        if (search) url += `&q=${search}`;
        return this.get(url);
    }

    // getTypes(): Promise<any> {
    //   return this._req.get('v1/handbooks/account/file/get-types', true);
    // }

    /*getList(): Promise<any> {
        return this.get('');
    }*/

    onInit() {
        this.url = 'v1/account/file';
    }

}
