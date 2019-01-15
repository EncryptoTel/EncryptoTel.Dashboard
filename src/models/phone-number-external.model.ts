export class PhoneNumberExternalModel {
    public phoneNumber: string;
    public login: string;
    public phoneAsLogin: boolean;
    public host: string;
    public port: number;
    public password: string;

    constructor (phonenumber?: string, login?: string, phoneAsLogin?: boolean, host?: string, port?: number, password?: string) {
        this.phoneNumber = phonenumber ? phonenumber : null;
        this.login = login ? login : null;
        this.phoneAsLogin = phoneAsLogin ? phoneAsLogin : null;
        this.host = host ? host : null;
        this.port = port ? port : null;
        this.password = password ? password : null;
    }


}
