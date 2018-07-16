import {Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";
import {AddressBookItem, AddressBookModel, TypeItem, TypesModel} from "../models/address-book.model";

@Injectable()

export class AddressBookService extends BaseService {
    //
    // block(data: object): Promise<any> {
    //     return this.request.post(`v1/blacklist`, data);
    // }
    //
    // getContacts(pageInfo: any): Promise<any> {
    //     return this.request.get(`v1/contact?page=${pageInfo.page}&limit=${pageInfo.limit}`);
    // }
    //
    // getContact(contactId: number): Promise<any> {
    //     return this.request.get(`v1/contact/${contactId}`);
    // }
    //
    // getCountries(): Promise<Countries> {
    //     return this.request.get(`v1/countries`);
    // }
    //
    // saveContact(contact): Promise<any> {
    //     return this.request.post(`v1/contact`, contact);
    // }
    //
    // delete(id: number): Promise<any> {
    //     return this.request.del(`v1/contact/${id}`);
    // }
    //
    // edit(id: number, contact): Promise<any> {
    //     return this.request.put(`v1/contact/${id}`, contact);
    // }
    //
    // search(keyword: string): Promise<any> {
    //     return this.request.get(`v1/contact?search=${keyword}`);
    // }

    getTypes(): Promise<TypesModel> {
        return this.get(`/get-types`).then((res: TypesModel) => {
            let result = new TypesModel();

            let keys = Object.keys(res.contactEmail);
            for (let i = 0; i < keys.length; i++) {
                let item = new TypeItem();
                item.id = res.contactEmail[keys[i]];
                item.value = keys[i];
                result.contactEmail.push(item);
            }

            keys = Object.keys(res.contactPhone);
            for (let i = 0; i < keys.length; i++) {
                let item = new TypeItem();
                item.id = res.contactPhone[keys[i]];
                item.value = keys[i];
                result.contactPhone.push(item);
            }

            return Promise.resolve(result);
        });
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<AddressBookModel> {
        return super.getItems(pageInfo, filter).then((res: AddressBookModel) => {
            let pageInfo = plainToClass(AddressBookModel, res);
            pageInfo.items = [];
            res['items'].map(item => {
                pageInfo.items.push(plainToClass(AddressBookItem, item));
            });
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'v1/contact';
    }

}
