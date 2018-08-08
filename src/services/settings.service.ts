import {Injectable} from '@angular/core';
import {BaseService} from "./base.service";

@Injectable()
export class SettingsService extends BaseService {

    getProfileSettings(): Promise<any> {
        return this.get('/user/profile');
    }

    saveProfileSettings(settings: any): Promise<any> {
        return this.post('/user/profile', settings);
    }

    requestEmailChange(email: any): Promise<any> {
        return this.post('/user/profile/change-email', {email: email});
    }

    confirmEmailChange(code: string): Promise<any> {
        return this.post('/user/profile/confirm-email', {code: code});
    }

    changePassword(form: any): Promise<any> {
        return this.post('/user/profile/change-password', form);
    }

    getQRCode(): Promise<any> {
        return this.get('/account/auth/get-qr-code');
    }

    saveSettings(settings, path, ShowSuccess = true): Promise<any> {
        return this.post(`${path}`, {settings: settings}, ShowSuccess);
    }

    getSettingsParams(path: string): Promise<any> {
        return this.get(path);
    }

    onInit() {
        this.url = 'v1/settings';
    }

}
