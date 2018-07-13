import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class SettingsServices {

  constructor(private _req: RequestServices) {}

  getProfileSettings(): Promise<any> {
    return this._req.get('v1/settings/user/profile');
  }

  saveProfileSettings(settings: any): Promise<any> {
    console.log(settings);
    return this._req.post('v1/settings/user/profile', {...settings});
  }

  requestEmailChange(email: any): Promise<any> {
    return this._req.post('v1/settings/user/profile/change-email', {...email});
  }

  confirmEmailChange(code: string): Promise<any> {
    return this._req.post('v1/settings/user/profile/confirm-email', {code: code});
  }

  changePassword(form: any): Promise<any> {
    return this._req.post('v1/settings/user/profile/change-password', {...form});
  }

  getAuthParams(): Promise<any> {
    return this._req.get('v1/settings/account/auth');
  }

  getBillingParams(): Promise<any> {
    return this._req.get('v1/settings/account/billing');
  }

  getNotificationsParams(): Promise<any> {
    return this._req.get('v1/settings/account/notifications');
  }

  getUserNotificationsParams(): Promise<any> {
    return this._req.get('v1/settings/user/notifications');
  }

  getQRCode(): Promise<any> {
    return this._req.get('v1/settings/account/auth/get-qr-code');
  }

  saveSetting(id, value, path): Promise<any> {
    const data = {};
    data[id] = value;
    return this._req.post(`v1/settings/${path}`, {settings: [{id: id, value: value}]});
  }
}
