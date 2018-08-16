import {Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {ExtensionItem, ExtensionModel, SipDepartmentItem} from "../models/extension.model";
import {plainToClass} from "class-transformer";

@Injectable()
export class ExtensionService extends BaseService {

    getExtension(id: number): Promise<any> {
        return this.request.get(`v1/sip/inners/${id}`);
    }

    deleteExtension(id: number): Promise<any> {
        return this.request.del(`v1/sip/inners/${id}`);
    }

    changePassword(id: number, data: any): Promise<any> {
        return this.request.post(`v1/sip/inners/${id}/change-password`, data);
    }

    getAccessList(userId: number): Promise<any> {
        return this.request.get(`v1/sip/inner/access-list` + (userId ? `?userId=${userId}` : ''));
    }

    saveAccessList(id: number, data: any): Promise<any> {
        return this.request.post(`v1/sip/inners/access/${id}`, {access: data});
    }







    create(data): Promise<any> {
        return this.post('', data);
    }

    edit(id: number, data): Promise<any> {
        return this.putById(id, data);
    }

    getItems(pageInfo: PageInfoModel, filter): Promise<ExtensionModel> {
        //filter['departmentFilter'] = true; // добавляется в исходный, а нам это не нужно
        let newFilter = [];
        let keys = Object.keys(filter);
        for (let i = 0; i < keys.length; i++) {
            if (filter[keys[i]]) {
                newFilter[keys[i]] = filter[keys[i]];
            }
        }
        newFilter['departmentFilter'] = true;
        return super.getItems(pageInfo, newFilter).then((res: ExtensionModel) => {
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
        this.url = 'sip/inners';
    }

}
