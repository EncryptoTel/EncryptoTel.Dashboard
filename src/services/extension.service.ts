import {Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {ExtensionItem, ExtensionModel, SipDepartmentItem} from "../models/extension.model";
import {plainToClass} from "class-transformer";

@Injectable()
export class ExtensionService extends BaseService {

    getExtension(id: number): Promise<any> {
        return this.request.get(`v1/sip/inners/${id}`, true);
    }

    deleteExtension(id: number): Promise<any> {
        return this.request.del(`v1/sip/inners/${id}`, true);
    }

    changePassword(id: number, data: any): Promise<any> {
        return this.request.post(`v1/sip/inners/${id}/change-password`, data, true);
    }

    create(data): Promise<any> {
        return this.request.post('v1/sip/inners', data, true);
    }

    edit(id: number, data): Promise<any> {
        return this.request.put(`v1/sip/inners/${id}`, data, true);
    }

    getAccessList(userId: number): Promise<any> {
        return this.request.get(`v1/sip/inner/access-list` + (userId ? `?userId=${userId}` : ''), true);
    }

    saveAccessList(id: number, data: any): Promise<any> {
        return this.request.post(`v1/sip/inners/access/${id}`, {access: data}, true);
    }







    getExtensions(pageInfo: PageInfoModel, filter): Promise<ExtensionModel> {
        return this.getItems(pageInfo, filter).then((res: ExtensionModel) => {
            let pageInfo = plainToClass(ExtensionModel, res);
            pageInfo.items = [];
            res['items'].map(item => {
                pageInfo.items.push(plainToClass(ExtensionItem, item));
            });
            pageInfo.departmentFilter = [];
            let dep = new SipDepartmentItem(0, 'All', pageInfo.itemsCount);
            pageInfo.departmentFilter.push(dep);
            res['departmentFilter'].map(item => {
                pageInfo.departmentFilter.push(plainToClass(SipDepartmentItem, item));
            });

            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'v1/sip/inners';
    }

}
