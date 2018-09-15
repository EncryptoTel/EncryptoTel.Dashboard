import {BaseItemModel, PageInfoModel} from "./base.model";
import {CountryModel} from "./country.model";
import {plainToClass} from "class-transformer";

export class AddressBookModel extends PageInfoModel {
    items: AddressBookItem[];
    countries: CountryModel[];
    types: TypesModel;
    contactFilter: ContactFilterModel[];
}

export class AddressBookItem extends BaseItemModel {
    firstname: string;
    lastname: string;
    contactPhone: ContactValueModel[] = [];
    contactEmail: ContactValueModel[] = [];
    countryId: number;
    company: string;
    department: string;
    position: string;
    address: string;
    blacklist: boolean;

    loading: number = 0;

    protected _country: CountryModel;

    constructor(response?) {
        super();

        if (response) {
            this.id = response.id;
            this.firstname = response.firstname;
            this.lastname = response.lastname;
            this.countryId = response.countryId;
            this.country = response.country;
            this.company = response.company;
            this.department = response.department;
            this.position = response.position;
            this.address = response.address;
            this.blacklist = response.blacklist || false;
            if (response.contactPhone) {
                for (let i = 0; i < response.contactPhone.length; i++) {
                    let item: ContactValueModel = response.contactPhone[i];
                    this.addContactPhone(plainToClass(ContactValueModel, item));
                }
            }
            if (response.contactEmail) {
                for (let i = 0; i < response.contactEmail.length; i++) {
                    let item: ContactValueModel = response.contactEmail[i];
                    this.addContactEmail(plainToClass(ContactValueModel, item));
                }
            }
        }
        else {
            this.firstname = null;
            this.lastname = null;
            this.company = null;
            this.department = null;
            this.position = null;
            this.address = null;
            this.blacklist = false;
            this._country = new CountryModel(null, '', '', '');
        }
    }

    get countryName() {
        return this.country ? this.country.title : null;
    }

    get phone() {
        return this.contactPhone.length > 0 ? this.contactPhone[0].value : null;
    }

    get email() {
        return this.contactEmail.length > 0 ? this.contactEmail[0].value : null;
    }

    get country() {
        return this._country;
    }

    set country(value) {
        this._country = value;
        this.countryId = value ? value.id : null;
    }

    addContactPhone(item: ContactValueModel) {
        // item.setParentObject(this);
        this.contactPhone.push(item);
    }

    addContactEmail(item: ContactValueModel) {
        // item.setParentObject(this);
        this.contactEmail.push(item);
    }

}

export class ContactValueModel extends BaseItemModel {
    value: string;
    typeId: number;
    types: TypesModel;
    protected _type;

    constructor() {
        super();
        this.value = '';
    }

    get type() {
        return this._type;
        // let item = this.types.contactPhone.find(item => item.id === this.typeId);
        // return item;
    }

    set type(value) {
        this._type = value;
        this.typeId = value ? value.id : null;
    }

    resetType() {
        this._type = null;
    }

}

export class TypesModel {
    contactEmail: TypeItem[] = [];
    contactPhone: TypeItem[] = [];
}

export class TypeItem {
    id: number;
    value: string;
}

export class ContactFilterModel {
    title: string;
    value: string;
    count: number;
    sort: number;

    get displayTitle() {
        return `${this.title} (${this.count})`;
    }
}
