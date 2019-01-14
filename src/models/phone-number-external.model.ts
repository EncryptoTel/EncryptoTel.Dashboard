export class PhoneNumberExternalModel {
    public phoneNumber: string;
    public host: string;
    public port: number;
    public password: string;

    constructor (phonenumber?: string, host?: string, port?: number, password?: string) {
        this.phoneNumber = phonenumber ? phonenumber : null;
        this.host = host ? host : null;
        this.port = port ? port : null;
        this.password = password ? password : null;
    }


}
