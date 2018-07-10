import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {PageInfoModel} from "../models/base.model";

@Injectable()
export class BaseService {

    public url: string;

    constructor(public request: RequestServices) {
        this.onInit();
    }

    getItem(id: number): Promise<any> {
        return this.get(`/${id}`);
    }

    getParams(): Promise<any> {
        return this.get(`/params`);
    }

    get(path: string): Promise<any> {
        return this.request.get(this.url + path, true);
    }

    getById(id: number): Promise<any> {
        return this.request.get(`${this.url}/${id}`, true);
    }

    post(path: string, data: any): Promise<any> {
        return this.request.post(this.url + path, data, true);
    }

    delete(path: string): Promise<any> {
        return this.request.del(this.url + path, true);
    }

    deleteById(id: number): Promise<any> {
        return this.request.del(`${this.url}/${id}`, true);
    }

    putById(id: number, data: any): Promise<any> {
        return this.request.put(`${this.url}/${id}`, data, true);
    }

    rawRequest(method: string, path: string, data: any): Promise<any> {
        return this.request.request(method, this.url + path, data);
    }

    getItems(pageInfo: PageInfoModel, params = []) {
        let url = `?page=${pageInfo.page}&limit=${pageInfo.limit}`;
        return this.request.get(`${this.url}${url}`, true);
    }

    beginLoading(item) {
        console.log('0', item.loading);
        if (item.loading == undefined) {
            item.loading = 0;
        }
        console.log('1', item.loading);
        item.loading++;
        console.log('2', item.loading);
    }

    endLoading(item) {
        item.loading--;
    }

    onInit() {

    }

}
