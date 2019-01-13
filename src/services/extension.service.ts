import {Injectable} from '@angular/core';
import {plainToClass} from 'class-transformer';

import {BaseService} from '@services/base.service';
import {PageInfoModel} from '@models/base.model';
import {ExtensionItem, ExtensionModel, SipDepartmentItem} from '@models/extension.model';


@Injectable()
export class ExtensionService extends BaseService {

    getExtension(id: number): Promise<any> {
        return this.request.get(`v1/sip/inners/${id}`);
    }

    getExtensionNumber(): Promise<any> {
        return this.request.get(`v1/sip/inners/get-number`);
    }

    deleteExtension(id: number): Promise<any> {
        return this.request.del(`v1/sip/inners/${id}`, false);
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
        return this.post('', data, false);
    }

    edit(id: number, data): Promise<any> {
        return this.putById(id, data, false);
    }

    getItems(pageInfo: PageInfoModel, filter, sort = null): Promise<ExtensionModel> {
        // filter['departmentFilter'] = true; // добавляется в исходный, а нам это не нужно
        let newFilter: any;
        newFilter = [];
        if (filter) {
            let keys: any;
            keys = Object.keys(filter);
            for (let i = 0; i < keys.length; i++) {
                if (filter[keys[i]]) {
                    newFilter[keys[i]] = filter[keys[i]];
                }
            }
        }
        newFilter['departmentFilter'] = true;
        return super.getItems(pageInfo, newFilter, sort)
            .then((response: ExtensionModel) => {
                const curPageInfo = plainToClass(ExtensionModel, response);
                curPageInfo.items = [];
                response['items'].map(item => {
                    curPageInfo.items.push(plainToClass(ExtensionItem, item));
                });
                curPageInfo.departmentFilter = [];
                const dep = new SipDepartmentItem(0, 'All', curPageInfo.itemsCount);
                curPageInfo.departmentFilter.push(dep);
                response['departmentFilter'].map(item => {
                    curPageInfo.departmentFilter.push(plainToClass(SipDepartmentItem, item));
                });

                return Promise.resolve(curPageInfo);
            });
    }

    onInit() {
        this.url = 'sip/inners';
    }

}
