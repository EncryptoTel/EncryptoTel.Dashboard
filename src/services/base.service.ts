import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {PageInfoModel} from "../models/base.model";

@Injectable()
export class BaseService {

    url: string = '';
    errors = null;

    constructor(public request: RequestServices) {
        this.onInit();
    }

    rawRequest(method: string, path: string, data: any): Promise<any> {
        this.resetErrors();
        return this.request.request(method, `${this.url}${path}`, data).then(res => {
            return Promise.resolve(res);
        }).catch(res => {
            if (res.errors) {
                this.errors = res.errors;
            }
            return Promise.reject(res);
        });
    }

    get(path: string): Promise<any> {
        return this.rawRequest('GET', path, null);
    }

    post(path: string, data: any): Promise<any> {
        return this.rawRequest('POST', path, {...data});
    }

    put(path: string, data: any): Promise<any> {
        return this.rawRequest('PUT', path, {...data});
    }

    delete(path: string): Promise<any> {
        return this.rawRequest('DELETE', path, null);
    }

    getById(id: number): Promise<any> {
        return this.get(`/${id}`);
    }

    putById(id: number, data: any): Promise<any> {
        return this.put(`/${id}`, data);
    }

    deleteById(id: number): Promise<any> {
        return this.delete(`/${id}`);
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
        return this.get(`${url}`);
    }

    getItem(id: number): Promise<any> {
        return this.get(`/${id}`);
    }

    getParams(): Promise<any> {
        return this.get(`/params`);
    }

    resetErrors() {
        this.errors = null;
    }

    onInit() {

    }

}
