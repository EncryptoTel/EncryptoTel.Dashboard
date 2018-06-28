import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class ExtensionsServices {

    constructor(private _req: RequestServices) {
    }

    getExtensions(page: number, limit: number, search: string, department: any): Promise<any> {
        let url = `v1/sip/inners?page=${page}`;
        if (limit) {
            url += `&limit=${limit}`;
        }
        if (search) {
            url += `&filter[search]=${search}`;
        }
        if (department && department.id) {
            url += `&filter[department]=${department.id}`;
        }
        return this._req.get(url, true);
    }

    deleteExtension(id: number): Promise<any> {
        return this._req.del(`v1/sip/inners/${id}`, true);
    }

    changePassword(id: number, data: any): Promise<any> {
        return this._req.post(`v1/sip/inners/${id}/change-password`, data, true);
    }

}
