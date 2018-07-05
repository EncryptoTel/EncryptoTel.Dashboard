import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class ExtensionsServices {

    constructor(private _req: RequestServices) {
    }

    getExtension(id: number): Promise<any> {
        return this._req.get(`v1/sip/inners/${id}`, true);
    }

    getExtensions(page: number, limit: number, search: string, department: any): Promise<any> {
        let url = `v1/sip/inners?page=${page}&filter[departmentFilter]=true`;
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

    create(data): Promise<any> {
        return this._req.post('v1/sip/inners', data, true);
    }

    edit(id: number, data): Promise<any> {
        return this._req.put(`v1/sip/inners/${id}`, data, true);
    }

    getAccessList(userId: number): Promise<any> {
        return this._req.get(`v1/sip/inner/access-list` + (userId ? `?userId=${userId}` : ''), true);
    }

    saveAccessList(id: number, data: any): Promise<any> {
        return this._req.post(`v1/sip/inners/access/${id}`, {access: data}, true);
    }

}
