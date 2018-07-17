import {BaseService} from "./base.service";
import {Injectable} from '@angular/core';
import {SortModel} from "../models/base.model";
import {StorageItem, StorageModel} from "../models/storage.model";
import {plainToClass} from "class-transformer";

@Injectable()

export class StorageService extends BaseService {

    pageInfo: StorageModel = new StorageModel();
    type: string;
    search: string;
    sort: SortModel;
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

    checkCompatibleType(file) {
        return ['audio/mp3', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/x-wav'].includes(file.type);
    }

    checkModal() {
        // console.log('checkModal');
        if (this.files.length > 0 && !this.modalUpload.visible) {
            this.loading ++;
            this.modalUpload.title = this.files[0].name;
            setTimeout(() => {
                this.modalUpload.visible = true;
            }, 100);
        }
    }

    checkFileExists(file) {
        const index = this.pageInfo.items.findIndex(item => item.fileName == file.name);
        // console.log('checkFileExists', index);
        if (index != -1) {
            this.files.push(file);
        } else {
            let pageInfo: StorageModel = new StorageModel();
            pageInfo.limit = 1;
            pageInfo.page = 1;
            this.loading++;
            this.getList(null, file.name, null).then(res => {
                // console.log(res);
                if (res.itemsCount > 0) {
                    this.files.push(file);
                    this.checkModal();
                } else {
                    this.uploadFile(file, null);
                }
                this.loading--;
            }).catch(res => {
                this.loading--;
            });
        }
    }

    deleteFileFromQueue() {
        // console.log('deleteFileFromQueue', this.files);
        this.files.splice(0, 1);
        // console.log('deleteFileFromQueue', this.files);
        this.checkModal();
        this.loading--;
    }

    cancelUploadAction() {
        // console.log('cancelUploadAction')
        this.deleteFileFromQueue();
    }

    uploadFile(file, mode, type = null): Promise<any> {
        this.loading +=1;
        const data = new FormData();
        data.append('type', type ? type : 'audio');
        data.append('account_file', file);
        if (mode) data.append('mode', mode);
        return this.rawRequest('POST', '', data).then(() => {
            this.loading -= 1;
            if (!this.loading) this.getList(this.type, this.search, this.sort);
        }).catch(() => {
            this.loading -= 1;
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
        this.deleteFileFromQueue();
    }

    doUploadFile(file, mode) {
        this.uploadFile(file, mode).then(res => {
            if (!this.loading) this.getList(this.type, this.search, this.sort);
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

    getList(type: string, search: string, sort: SortModel): Promise<StorageModel> {
        this.loading++;
        this.select = [];
        this.type = type;
        this.search = search;
        this.sort = sort;
        let url = `?limit=${this.pageInfo.limit}&page=${this.pageInfo.page}`;
        if (type) url += `&type=${type}`;
        if (search) url += `&q=${search}`;
        if (sort) url = url + `&sort[${sort.column}]=${sort.isDown ? 'down' : 'up'}`;
        return this.get(url).then((res: StorageModel) => {
            this.pageInfo = this.plainToClassEx(StorageModel, StorageItem, res);
            this.loading--;
            return Promise.resolve(this.pageInfo);
        }).catch(() => {
            this.loading--;
            return Promise.reject(this.pageInfo);
        });
    }

    // getTypes(): Promise<any> {
    //   return this._req.get('v1/handbooks/account/file/get-types', true);
    // }

    deleteById(id: number): Promise<any> {
        this.loading++;
        return super.deleteById(id).then(res => {
            this.loading--;
            if (!this.loading) this.getList(this.type, this.search, this.sort);
        }).catch(res => {
            this.loading--;
        });
    }

    onInit() {
        this.url = 'v1/account/file';
    }

}
