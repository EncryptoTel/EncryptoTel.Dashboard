import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";
import {MessageServices} from "./message.services";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BaseService {

    url: string = '';
    errors = null;

    constructor(public request: RequestServices,
                public message: MessageServices,
                public http: HttpClient) {
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

    rawRequest(method: string, path: string, data: any, ShowSuccess = true, ShowError = null): Promise<any> {
        this.resetErrors();
        return this.request.request(method, `${this.url}${path}`, data, ShowSuccess, ShowError).then(res => {
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

    post(path: string, data: any, ShowSucess = true, ShowError = null): Promise<any> {
        return this.rawRequest('POST', path, {...data}, ShowSucess, ShowError).then((res) => {
            if (ShowSucess) {
                this.message.writeSuccess(res.message ? res.message : 'Successfully created.');
            }
            return Promise.resolve(res);
        });
    }

    put(path: string, data: any, ShowSucess = true, ShowError = null): Promise<any> {
        return this.rawRequest('PUT', path, {...data}, ShowSucess, ShowError).then((res) => {
            if (ShowSucess) {
                this.message.writeSuccess(res.message ? res.message : 'Successfully saved.');
            }
            return Promise.resolve(res);
        });
    }

    delete(path: string, ShowSucess = true): Promise<any> {
        return this.rawRequest('DELETE', path, null).then((res) => {
            if (ShowSucess) {
                this.message.writeSuccess(res.message ? res.message : 'Successfully deleted.');
            }
            return Promise.resolve(res);
        });
    }

    getById(id: number): Promise<any> {
        return this.get(`/${id}`);
    }

    putById(id: number, data: any, showSuccess = true, showError = null): Promise<any> {
        return this.put(`/${id}`, data, showSuccess, showError);
    }

    deleteById(id: number, showSucess = true): Promise<any> {
        return this.delete(`/${id}`, showSucess);
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<PageInfoModel> {
        let url = `?page=${pageInfo.page}&limit=${pageInfo.limit}`;
        if (filter) {
            let keys = Object.keys(filter);
            keys.forEach(key => {
                if (filter[key]) url = `${url}&filter[${key}]=${filter[key]}`;
            });
        }
        if (sort) {
            url = `${url}&sort[${sort.column}]=${sort.isDown ? 'desc' : 'asc'}`;
        }
        return this.get(`${url}`).then(res => {
            let pageinfo = res;
            pageinfo.limit = pageInfo.limit;
            if (res.items.length === 0 && pageInfo.page > 1) {
                pageInfo.page--;
                return this.getItems(pageInfo, filter, sort);
            } else {
                return Promise.resolve(pageinfo);
            }
        });
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

    getMediaData(mediaId: number): Promise<any> {
        return this.request.get(`v1/account/file/${mediaId}`)
            .then(mediaDataResponse => {
                return this.http.get(mediaDataResponse['fileLink']).toPromise()
                    .then(response => {
                        return this.validateMediaStreamResponse(response)
                            ? Promise.resolve(mediaDataResponse)
                            : Promise.reject(response);
                    })
                    .catch(error => {
                        return this.validateMediaStreamResponse(error)
                            ? Promise.resolve(mediaDataResponse)
                            : Promise.reject(error);
                    });
            });
    }

    validateMediaStreamResponse(response: any): boolean {
        if (response.status != 200) {
            this.message.writeError('File not found');
            console.log('Media stream error', response);
            return false;
        }
        return true;
    }

    onInit(): void {}
}
