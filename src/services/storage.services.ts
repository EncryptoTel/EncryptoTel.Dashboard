import {BaseService} from './base.service';

export class StorageServices extends BaseService {

    uploadFile(data: FormData): Promise<any> {
        return this.rawRequest('POST', '', data);
    }

    getList(): Promise<any> {
        return this.get('');
    }

    onInit() {
        this.url = 'v1/account/file';
    }

}
