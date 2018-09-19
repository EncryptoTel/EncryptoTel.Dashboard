import {Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {RequestServices} from './request.services';
import {HttpClient} from '@angular/common/http';
import {StorageModel} from '../models/storage.model';
import {ModalEx} from '../elements/pbx-modal/pbx-modal.component';
import {MessageServices} from './message.services';

@Injectable()
export class SettingsService extends BaseService {

    public callback;
    public loading: number;
    public successCount: number;
    public errorCount: number;

    private _compatibleMediaTypes: string[];

    constructor(
        public request: RequestServices,
        public message: MessageServices,
        public http: HttpClient
    ) {
        super(request, message, http);
        this.loading = 0;
        this.successCount = 0;
        this.errorCount = 0;
        this._compatibleMediaTypes = [ 'image/jpeg', 'image/png', 'image/gif', 'image/jpg' ];
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

    saveSettings(settings, path, ShowSuccess = true): Promise<any> {
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
        this.callback ? this.callback(this.loading) : null;
        return this.rawRequest('POST', '/user/profile/upload', data).then(() => {
            if (this.loading === 1) {
                // this.getItems(this.pageInfo, this.filter, this.sort);
            }
            this.successCount++;
            this.errorCount++;
            this.updateLoading(-1);
        }).catch(() => {
            this.errorCount++;
            this.updateLoading(-1);
        });
    }

    updateLoading(increment: number) {
        this.loading += increment;
        this.callback ? this.callback(this.loading) : null;
        // if (this.callback && this.loading == 0 && this.files.length == 0 && !this.modalUpload.visible) {
        //     this.callback = null;
        // }
    }

}
