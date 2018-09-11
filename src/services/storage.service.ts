import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { BaseService } from "./base.service";
import { RequestServices } from "./request.services";
import { MessageServices } from "./message.services";

import { PageInfoModel } from "../models/base.model";
import { StorageItem, StorageModel } from "../models/storage.model";

import { ModalEx } from "../elements/pbx-modal/pbx-modal.component";


@Injectable()
export class StorageService extends BaseService {
    public pageInfo: StorageModel;
    public filter;
    public sort;
    public loading: number;
    public files = [];
    public modalUpload: ModalEx;
    public select = [];
    public callback;
    public successCount: number;
    public errorCount: number;

    private _compatibleMediaTypes: string[];

    constructor(
        public request: RequestServices,
        public message: MessageServices,
        public http: HttpClient
    ) {
        super(request, message, http);

        this.pageInfo = new StorageModel();
        this.modalUpload = new ModalEx('', 'replaceOnlyFiles');
        this.loading = 0;
        this.successCount = 0;
        this.errorCount = 0;

        this._compatibleMediaTypes = [ 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/x-wav' ];
    }

    onInit(): void {
        this.url = 'account/file';
    }

    checkCompatibleType(file: any): boolean {
        return this._compatibleMediaTypes.includes(file.type);
    }

    updateLoading(increment: number) {
        this.loading += increment;
        this.callback ? this.callback(this.loading) : null;
        if (this.callback && this.loading == 0 && this.files.length == 0 && !this.modalUpload.visible) {
            this.callback = null;
        }
    }

    checkModal(): void {
        if (this.files.length > 0 && !this.modalUpload.visible) {
            this.updateLoading(1);
            this.modalUpload.body = `A file ${this.files[0].name} has already been uploaded. Do you want to replace it?`;
            setTimeout(() => {
                this.modalUpload.visible = true;
            }, 100);
        }
    }

    checkFileExists(file, callback = null): void {
        this.callback = callback;
        const index = this.pageInfo.items.findIndex(item => item.fileName == file.name);
        if (index != -1) {
            this.files.push(file);
        }
        else {
            let pageInfo: StorageModel = new StorageModel();
            pageInfo.limit = 1;
            pageInfo.page = 1;
            this.updateLoading(1);
            this.get(`?filter[search]=${file.name}`)
                .then(result => {
                    if (result.itemsCount > 0) {
                        this.files.push(file);
                        this.checkModal();
                    }
                    else {
                        this.uploadFile(file, null, null);
                    }
                    this.updateLoading(-1);
                }).catch(error => {
                    console.log('checkFileExists', error);
                    this.updateLoading(-1);
                });
        }
    }

    deleteFileFromQueue() {
        this.files.splice(0, 1);
        this.checkModal();
        this.updateLoading(-1);
    }

    cancelUploadAction() {
        this.modalUpload.visible = false;
        this.deleteFileFromQueue();
    }

    uploadFile(file, mode, type = null): Promise<any> {
        this.updateLoading(1);
        const data = new FormData();
        data.append('type', type ? type : 'audio');
        data.append('account_file', file);
        if (mode) data.append('mode', mode);
        this.callback ? this.callback(this.loading) : null;
        return this.rawRequest('POST', '', data).then(() => {
            if (this.loading === 1) this.getItems(this.pageInfo, this.filter, this.sort);
            this.successCount++;
            this.errorCount++;
            this.updateLoading(-1);
        }).catch(() => {
            this.errorCount++;
            this.updateLoading(-1);
        });
    }

    doUploadAction(button) {
        switch (button.tag) {
            case 1:
                this.doUploadFile(this.files[0], 'replace');
                break;
            case 2:
                this.doUploadFile(this.files[0], 'new');
                break;
        }
        this.modalUpload.visible = false;
        this.deleteFileFromQueue();
    }

    doUploadFile(file, mode) {
        this.uploadFile(file, mode).then(res => {
            if (!this.loading) this.getItems(this.pageInfo, this.filter, this.sort);
        });
    }

    find(array, value): boolean {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }

    selectItem(id: number): void {
        if (this.find(this.select, id)) {
            this.select.splice(this.select.indexOf(id), 1);
        } else {
            this.select.push(id);
        }
    }

    deleteById(id: number, callback = null, type = null, showSuccess = true): Promise<any> {
        this.callback = callback;
        this.updateLoading(1);

        if (type === 'delete') {
            return super.deleteById(id, showSuccess, 'delete')
                .then(result => {
                    if (this.loading === 1) {
                        this.getItems(this.pageInfo, this.filter, this.sort);
                    }
                    this.successCount++;
                    this.updateLoading(-1);
                }).catch(() => {
                    this.errorCount++;
                    this.updateLoading(-1);
                });
        }

        if (type === 'trash') {
            return super.trashById(id, showSuccess)
                .then(result => {
                    if (this.loading === 1) {
                        this.getItems(this.pageInfo, this.filter, this.sort);
                    }
                    this.successCount++;
                    this.updateLoading(-1);
                }).catch(() => {
                    this.errorCount++;
                    this.updateLoading(-1);
                });
        }
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<StorageModel> {
        this.updateLoading(1);

        this.filter = filter;
        this.sort = sort;
        return super.getItems(pageInfo, filter, sort)
            .then((result: StorageModel) => {
                this.pageInfo = this.plainToClassEx(StorageModel, StorageItem, result);
                this.pageInfo.items.forEach((item: StorageItem) => {
                    item.record.playable = this.isRecordPlayable(item);
                    item.record.duration = item.duration;
                });
                this.updateLoading(-1);
                return Promise.resolve(this.pageInfo);
            }).catch((error) => {
                this.updateLoading(-1);
                return Promise.reject(error);
            });
    }

    isRecordPlayable(item: StorageItem): boolean {
        return item.fileSize > 0;
    }

    resetCount() {
        this.successCount = 0;
        this.errorCount = 0;
    }
}
