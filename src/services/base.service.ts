import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";
import {MessageServices} from "./message.services";

@Injectable()
export class BaseService {

    url: string = '';
    errors = null;

    constructor(public request: RequestServices,
                public message: MessageServices) {
        this.onInit();
    }

    plainToClassEx(classModel, classItems, res: PageInfoModel) {
        let pageInfo: PageInfoModel = plainToClass(classModel, res);
        pageInfo.items = [];
        res['items'].map(item => {
            pageInfo.items.push(plainToClass(classItems, item));
        });
        return pageInfo;
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
        return this.rawRequest('POST', path, {...data}).then((res) => {
            this.message.writeSuccess(res.message ? res.message : 'Successfully created.');
            return Promise.resolve(res);
        });
    }

    put(path: string, data: any): Promise<any> {
        return this.rawRequest('PUT', path, {...data}).then((res) => {
            this.message.writeSuccess(res.message ? res.message : 'Successfully saved.');
            return Promise.resolve(res);
        });
    }

    delete(path: string): Promise<any> {
        return this.rawRequest('DELETE', path, null).then((res) => {
            this.message.writeSuccess(res.message ? res.message : 'Successfully deleted.');
            return Promise.resolve(res);
        });
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

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<any> {
        let url = `?page=${pageInfo.page}&limit=${pageInfo.limit}`;
        if (filter) {
            let keys = Object.keys(filter);
            for (let i = 0; i < keys.length; i++) {
                if (filter[keys[i]]) {
                    url = `${url}&filter[${keys[i]}]=${filter[keys[i]]}`;
                }
            }
        }
        if (sort) {
            url = `${url}&sort[${sort.column}]=${sort.isDown ? 'desc' : 'asc'}`;
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
