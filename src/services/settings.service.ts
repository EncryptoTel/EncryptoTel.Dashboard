import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {BaseService} from "./base.service";

@Injectable()
export class SettingsService extends BaseService {

    getProfileSettings(): Promise<any> {
        return this.get('/user/profile');
    }

    saveProfileSettings(settings: any): Promise<any> {
        // console.log(settings);
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

    getAuthParams(): Promise<any> {
        return this.get('/account/auth');
    }

    getBillingParams(): Promise<any> {
        return this.get('/account/billing');
    }

    getNotificationsParams(): Promise<any> {
        return this.get('/account/notifications');
    }

    getUserNotificationsParams(): Promise<any> {
        return this.get('/user/notifications');
    }

    getQRCode(): Promise<any> {
        return this.get('/account/auth/get-qr-code');
    }

    saveSetting(id, value, path): Promise<any> {
        const data = {};
        data[id] = value;
        return this.post(`/${path}`, {settings: [{id: id, value: value}]});
    }

    onInit() {
        this.url = 'v1/settings';
    }

}
