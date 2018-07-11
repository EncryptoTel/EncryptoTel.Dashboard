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
    sipOuter: SipOuterModel;
    status: number;
    statusName: string;
    user: UserModel;

    get extension(): string {
        return this.phoneNumber;
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

    get displayName(): string {
        return `${this.name} (${this.sipCount})`;
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
