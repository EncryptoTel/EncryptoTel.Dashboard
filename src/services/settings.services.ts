import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class SettingsServices {

  constructor(private _req: RequestServices) {}

  getProfileSettings(): Promise<any> {
    return this._req.get('v1/settings/user/profile', true);
  }

  saveProfileSettings(settings: any): Promise<any> {
    return this._req.post('v1/settings/user/profile', {settings}, true);
  }

  requestEmailChange(email: any): Promise<any> {
    return this._req.post('v1/settings/user/profile/change-email', {...email}, true);
  }

  confirmEmailChange(code: string): Promise<any> {
    return this._req.post('v1/settings/user/profile/confirm-email', {code: code}, true);
  }

  changePassword(form: any): Promise<any> {
    return this._req.post('v1/settings/user/profile/change-password', {...form}, true);
  }

  getAuthParams(): Promise<any> {
    return this._req.get('v1/settings/account/auth', true);
  }

  getBillingParams(): Promise<any> {
    return this._req.get('v1/settings/account/billing', true);
  }

  getNotificationsParams(): Promise<any> {
    return this._req.get('v1/settings/account/notifications', true);
  }

  getUserNotificationsParams(): Promise<any> {
    return this._req.get('v1/settings/user/notifications', true);
  }

  saveSetting(id, value, path): Promise<any> {
    const data = {};
    data[id] = value;
    return this._req.post(`v1/settings/${path}`, {settings: {...data}}, true);
  }
}
