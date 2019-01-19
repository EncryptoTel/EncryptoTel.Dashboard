import {BaseItemModel, PageInfoModel} from './base.model';

export class PhoneNumberModel extends PageInfoModel {
    items: PhoneNumberItem[];
}

export class PhoneNumberItem extends BaseItemModel {
    phoneNumber: string;
    status: number;
    providerId: number;
    sipInners: SipInnerModel[] = [];
    safe: boolean = false;
    editable: boolean = false;
    private _statusName: string;
    private _typeName: string;

    get phoneNumberWithType() {
        if (this.providerId === 1) {
           return this.phoneNumber;
        } else {
            return '+' + this.phoneNumber;
        }
    }

    get innersCount() {
        return this.sipInners.length;
    }

    get defaultInner() {
        let result = 'Not defined';
        this.sipInners.map((item: SipInnerModel) => {
            if (item.default) {
                result = `#${item.phoneNumber}`;
            }
        });
        return result;
    }

    get statusName() {
        if (this._statusName) {
            return this._statusName;
        } else {
            return !!this.status ? 'Enabled' : 'Disabled';
        }
    }

    set statusName(status: string) {
        this._statusName = status;
    }

    get typeName() {
        if (this._typeName) {
            return this._typeName;
        } else {
            return this.providerId === 1 ? 'Internal' : 'External';
        }
    }

    set typeName(type: string) {
        this._typeName = type;
    }

    get delete() {
        return this.safe;
    }

}

export class SipInnerModel extends BaseItemModel {
    phoneNumber: string;
    default: boolean;
}
