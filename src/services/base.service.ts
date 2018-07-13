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
        return this.request.get(this.url + path);
    }

    getItemz(path: string, pageInfo: PageInfoModel): Promise<any> {
        return this.request.get(`${this.url}${path}?page=${pageInfo.page}&limit=${pageInfo.limit}`);
    }

    getById(id: number): Promise<any> {
        return this.request.get(`${this.url}/${id}`);
    }

    post(path: string, data: any): Promise<any> {
        return this.request.post(this.url + path, data);
    }

    delete(path: string): Promise<any> {
        return this.request.del(this.url + path);
    }

    deleteById(id: number): Promise<any> {
        return this.request.del(`${this.url}/${id}`);
    }

    putById(id: number, data: any): Promise<any> {
        return this.request.put(`${this.url}/${id}`, data);
    }

    rawRequest(method: string, path: string, data: any): Promise<any> {
        return this.request.request(method, this.url + path, data);
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<any> {
        let url = `?page=${pageInfo.page}&limit=${pageInfo.limit}`;
        if (filter) {
            let keys = Object.keys(filter);
            for (let i = 0; i < keys.length; i++) {
                if (filter[keys[i]]) {
                    url = `${url}&filter[${keys[i]}]=${filter[keys[i]]}`;
                }
            }
        }
        return this.request.get(`${this.url}${url}`);
    }

    beginLoading(item) {
        // console.log('0', item.loading);
        if (item.loading == undefined) {
            item.loading = 0;
        }
        // console.log('1', item.loading);
        item.loading++;
        // console.log('2', item.loading);
    }

    endLoading(item) {
        item.loading--;
    }

    onInit() {

    }

}
