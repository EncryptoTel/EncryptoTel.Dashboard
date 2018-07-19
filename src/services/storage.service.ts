import {BaseService} from "./base.service";
import {Injectable} from '@angular/core';
import {PageInfoModel, SortModel} from "../models/base.model";
import {StorageItem, StorageModel} from "../models/storage.model";
import {plainToClass} from "class-transformer";

@Injectable()

export class StorageService extends BaseService {

    pageInfo: StorageModel = new StorageModel();
    filter;
    sort;
    loading = 0;
    files = [];
    modalUpload = {
        visible: false,
        title: '',
        body: 'A file with this name has already been created.  Do you want to replace or rename it?',
        buttons: [
            {tag: 1, type: 'error', value: 'Replace'},
            {tag: 2, type: 'success', value: 'Rename'},
            {tag: 0, type: 'cancel', value: 'Cancel'}
        ]
    };
    select = [];
    callback;

    checkCompatibleType(file) {
        return ['audio/mp3', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/x-wav'].includes(file.type);
    }

    updateLoading(inc: number) {
        this.loading += inc;
        this.callback ? this.callback(this.loading) : null;
        // console.log('updateLoading', this.loading);
        if (this.callback && this.loading === 0 && this.files.length === 0 && !this.modalUpload.visible) {
            // console.log('done', this.loading);
            this.callback = null;
        }
    }
    
    checkModal() {
        // console.log('checkModal', this.files.length, this.modalUpload.visible);
        if (this.files.length > 0 && !this.modalUpload.visible) {
            this.updateLoading(1);
            this.modalUpload.title = this.files[0].name;
            setTimeout(() => {
                this.modalUpload.visible = true;
            }, 100);
        }
    }

    checkFileExists(file, callback = null) {
        this.callback = callback;
        const index = this.pageInfo.items.findIndex(item => item.fileName == file.name);
        if (index != -1) {
            this.files.push(file);
        } else {
            let pageInfo: StorageModel = new StorageModel();
            pageInfo.limit = 1;
            pageInfo.page = 1;
            this.updateLoading(1);
            this.get(`?q=${file.name}`).then(res => {
                // console.log(res);
                if (res.itemsCount > 0) {
                    this.files.push(file);
                    this.checkModal();
                } else {
                    this.uploadFile(file, null, null);
                }
                this.updateLoading(-1);
            }).catch(() => {
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
            this.updateLoading(-1);
        }).catch(() => {
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

    deleteById(id: number): Promise<any> {
        this.updateLoading(1);
        return super.deleteById(id).then(res => {
            if (this.loading === 1) this.getItems(this.pageInfo, this.filter, this.sort);
            this.updateLoading(-1);
        }).catch(() => {
            this.updateLoading(-1);
        });
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<StorageModel> {
        this.updateLoading(1);
        this.filter = filter;
        this.sort = sort;
        return super.getItems(pageInfo, filter, sort).then((res: StorageModel) => {
            this.pageInfo = this.plainToClassEx(StorageModel, StorageItem, res);
            this.updateLoading(-1);
            return Promise.resolve(this.pageInfo);
        }).catch(() => {
            this.updateLoading(-1);
            return Promise.reject(this.pageInfo);
        });
    }

    onInit() {
        this.url = 'v1/account/file';
    }

}