import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class BaseService {

    public url: string;

    constructor(public request: RequestServices) {
        this.onInit();
    }

    get(path: string): Promise<any> {
        return this.request.get(this.url + path, true);
    }

    rawRequest(method: string, path: string, data: any): Promise<any> {
        return this.request.request(method, this.url + path, data);
    }

    onInit() {

    }

}
