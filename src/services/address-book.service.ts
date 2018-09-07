import {BaseService} from './base.service';
import {plainToClass} from 'class-transformer';
import {
    AddressBookItem,
    AddressBookModel,
    ContactFilterModel,
    TypeItem,
    TypesModel
} from '../models/address-book.model';

export class AddressBookService extends BaseService {
    items: AddressBookItem[] = [];

    onInit() {
        this.url = 'contact';
    }

    blockByContact(id: number, blacklist = false): Promise<any> {
        if (blacklist) {
            return this.request.del(`v1/blacklist/${id}`);
        } else {
            return this.request.post('v1/blacklist', {contact: id});
        }
    }

    getTypes(): Promise<TypesModel> {
        return this.get(`/get-types`).then((res: TypesModel) => {
            let result: TypesModel;
            result = new TypesModel();

            let keys = Object.keys(res.contactEmail);
            for (let i = 0; i < keys.length; i++) {
                let item: TypeItem;
                item = new TypeItem();
                item.id = res.contactEmail[keys[i]];
                item.value = keys[i];
                result.contactEmail.push(item);
            }

            keys = Object.keys(res.contactPhone);
            for (let i = 0; i < keys.length; i++) {
                let item: TypeItem;
                item = new TypeItem();
                item.id = res.contactPhone[keys[i]];
                item.value = keys[i];
                result.contactPhone.push(item);
            }

            return Promise.resolve(result);
        });
    }

    getItems(pageInfo: AddressBookModel, filter = null): Promise<AddressBookModel> {
        return super.getItems(pageInfo, filter).then((response: any) => {
            let pageinfo: AddressBookModel;
            pageinfo = this.plainToClassEx<AddressBookModel, AddressBookItem>(AddressBookModel, AddressBookItem, response);
            pageinfo.contactFilter = [];
            response.contactFilter.map(filter => {
                pageinfo.contactFilter.push(plainToClass<ContactFilterModel, {}>(ContactFilterModel, filter));
            });
            return Promise.resolve(pageinfo);
        });
    }

    getAddressBookItem(id: number): Promise<AddressBookItem> {
        let item = this.items.find(item => item.id === id);
        return super.getById(id).then((response: AddressBookItem) => {
            item = new AddressBookItem(response);
            this.items.push(item);
            return item;
        });
    }
}
