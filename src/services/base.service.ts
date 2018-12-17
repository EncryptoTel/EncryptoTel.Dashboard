import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";
import {MessageServices} from "./message.services";
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class BaseService {
    public errors = null;

    private _url: string = '';

    public get url(): string {
        return this._url;
    }

    public set url(uri: string) {
        this._url = [ environment.backApiVersion, uri ].join('/');
    }

    constructor(public request: RequestServices,
                public message: MessageServices,
                public http: HttpClient,
                public translate: TranslateService) {
        this.onInit();
    }

    plainToClassEx<TPage extends PageInfoModel, TPageItem>(classModel: any, classItems: any, object: any): TPage {
        let pageInfo: TPage = plainToClass<TPage, {}>(classModel, object);
        pageInfo.items = [];
        if (object.hasOwnProperty('items')) {
            object.items.map(item => {
                pageInfo.items.push(plainToClass<TPageItem, {}>(classItems, item));
            });
        }
        return pageInfo;
    }

    rawRequest(method: string, path: string, data: any, ShowSuccess = true, ShowError = null): Promise<any> {
        let _method: string;
        _method = method;
        this.resetErrors();
        return this.request.request(method, `${this.url}${path}`, data, ShowSuccess, ShowError).then(response => {
            return Promise.resolve(response);
        }).catch(response => {
            if (response.errors) {
                this.errors = response.errors;
                if (this.url === 'v1/sip/inners' && (_method === 'PUT' || _method === 'POST')) {
                    if (this.errors.user['lastName'] || this.errors.user['firstName']) {
                        const lastName = this.errors.user['lastName'];
                        const firstName = this.errors.user['firstName'];
                        delete this.errors.user;
                        if (lastName) {
                            this.errors['lastName'] = lastName;
                        }
                        if (firstName) {
                            this.errors['firstName'] = firstName;
                        }
                    }
                }
            }
            return Promise.reject(response);
        });
    }

    get(path: string = ''): Promise<any> {
        return this.rawRequest('GET', path, null);
    }

    post(path: string, data: any, ShowSucess = true, ShowError = null): Promise<any> {
        return this.rawRequest('POST', path, {...data}, ShowSucess, ShowError).then((res) => {
            if (ShowSucess) {
                this.message.writeSuccess(res.message ? this.translate.instant(res.message) : 'Successfully created.');
            }
            return Promise.resolve(res);
        });
    }

    put(path: string, data: any, ShowSucess = true, ShowError = null): Promise<any> {
        return this.rawRequest('PUT', path, {...data}, ShowSucess, ShowError).then((res) => {
            if (ShowSucess) {
                this.message.writeSuccess(res.message ? this.translate.instant(res.message) : 'Successfully saved.');
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

    trash(path: string, ShowSucess = true): Promise<any> {
        return this.rawRequest('DELETE', path, null).then((res) => {
            if (ShowSucess) {
                this.message.writeSuccess(res.message ? res.message : 'Successfully trashed.');
            }
            return Promise.resolve(res);
        });
    }

    restore(path: string, ShowSucess = true): Promise<any> {
        return this.rawRequest('POST', path, null).then((res) => {
            if (ShowSucess) {
                this.message.writeSuccess(res.message ? res.message : 'Successfully restored.');
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

    deleteById(id: number, showSucess = true, path = null): Promise<any> {
        if (path != null) {
            return this.delete(`/${path}/${id}`, showSucess);
        } else {
            return this.delete(`/${id}`, showSucess);
        }
    }

    deleteAll(showSucess = true, path = null): Promise<any> {
        if (path != null) {
            return this.delete(`/${path}/all`, showSucess);
        } else {
            return this.delete(`/all`, showSucess);
        }
    }

    restoreById(id: number, showSucess = true, path = null): Promise<any> {
        return this.restore(`/${path}/${id}`, showSucess);
    }

    trashById(id: number, showSucess = true): Promise<any> {
        return this.trash(`/trash/${id}`, showSucess);
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
            res.items.forEach(item => {
                if (item.sip && item.sip.providerId !== 1) {
                    item.sip.phoneNumber = '+' + item.sip.phoneNumber;
                }
                if (item.sipOuter && item.sipOuter.providerId && item.sipOuter.providerId !== 1) {
                    item.sipOuter.phoneNumber = '+' + item.sipOuter.phoneNumber;
                }
            });
            Promise.resolve(res);

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

    public onInit(): void {}
}
