import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';

import {BaseService} from '@services/base.service';
import {RequestServices} from '@services/request.services';
import {MessageServices} from '@services/message.services';
import {SettingsOptionItem} from '@models/settings.models';


@Injectable()
export class SettingsService extends BaseService {

    callback;
    loading: number;
    successCount: number;
    errorCount: number;

    private compatibleMediaTypes: string[];

    constructor(public request: RequestServices,
                public message: MessageServices,
                public http: HttpClient,
                public translate: TranslateService) {
        super(request, message, http, translate);

        this.loading = 0;
        this.successCount = 0;
        this.errorCount = 0;
        this.compatibleMediaTypes = [ 'image/jpeg', 'image/png', 'image/gif', 'image/jpg' ];
    }

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

    saveSettings(settings: SettingsOptionItem[], path, ShowSuccess = true): Promise<any> {
        // settings.forEach(s => {
        //     s.value = s.value;
        // });
        return this.post(`${path}`, {settings: settings}, ShowSuccess);
    }

    getSettingsParams(path: string): Promise<any> {
        return this.get(path);
    }

    onInit() {
        this.url = 'settings';
    }

    uploadFile(file, mode, type = null): Promise<any> {
        this.updateLoading(1);

        const data = new FormData();
        data.append('type', type ? type : 'image');
        data.append('profile_file', file);
        if (mode) data.append('mode', mode);

        if (this.callback) this.callback(this.loading);

        return this.rawRequest('POST', '/user/profile/upload', data)
            .then((user) => {
                if (this.loading === 1) {
                }
                this.successCount++;
                this.errorCount++;
                this.updateLoading(-1);
                return user;
            })
            .catch(() => {
                this.errorCount ++;
                this.updateLoading(-1);
            });
    }

    updateLoading(increment: number) {
        this.loading += increment;
        if (this.callback) this.callback(this.loading);
        // if (this.callback && this.loading == 0 && this.files.length == 0 && !this.modalUpload.visible) {
        //     this.callback = null;
        // }
    }

}
