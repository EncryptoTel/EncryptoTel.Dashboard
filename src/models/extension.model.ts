export class ExtensionModel {
    id: number;
    phoneNumber: string;
    mobileApp: boolean;
    default: boolean;
    online: boolean;
    statusName: string;
    sipOuter: SipOuterModel;
    user: UserModel;
    get userFirstName(): string {
        return this.user ? this.user.firstname : null;
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
