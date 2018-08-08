export class SignUpFormModel {
    ref: string;
    uniqueHash: string;

    constructor(public username: string,
                public email: string,
                public password: string,
                public password_confirmation: string) {
    }
}
