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
}
