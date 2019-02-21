import {BaseItemModel, PageInfoModel} from "./base.model";

export class ExtensionModel extends PageInfoModel {
    items: ExtensionItem[];
    departmentFilter: SipDepartmentItem[];
}

export class ExtensionItem extends BaseItemModel {
    // phoneNumber: string;
    callRecord: boolean;
    default: boolean;
    encryption: boolean;
    mobileApp: boolean;
    online: boolean;
    phoneNumber: string;
    host: string;
    port: string;
    sipOuter: SipOuterModel;
    status: number;
    editable: boolean = true;
    // statusName: string;
    user: UserModel;
    _statusName: string;

    get extension(): string {
        return this.phoneNumber;
    }

    get extensionPort(): string {
        return this.port;
    }

    get extensionHost(): string {
        return this.host;
    }

    get userFirstName(): string {
        return this.user ? this.user.firstname : null;
    }

    get userLastName(): string {
        return this.user ? this.user.lastname : null;
    }

    get userEmail(): string {
        return this.user ? this.user.email : null;
    }

    get phone(): string {
        return this.sipOuter ? this.sipOuter.phoneNumber : null;
    }

    get statusName(): string {
        if (this._statusName) {
            return this._statusName;
        } else {
            return this.status ? 'enable' : 'disable';
        }
    }

    set statusName(value) {
        this._statusName = value;
    }

    get isMobileApp(): string {
        return this.mobileApp ? 'Enabled' : 'Disabled';
    }

}

export class SipDepartmentItem extends BaseItemModel {
    name: string;
    sipCount: number;

    constructor(id?: number, name?: string, sipCount?: number) {
        super();

        this.id = id;
        this.name = name;
        this.sipCount = sipCount;
    }
}

export class SipOuterModel {
    id: number;
    phoneNumber: string;
}

export class UserModel {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
}
