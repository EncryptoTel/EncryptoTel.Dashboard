import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../services/storage.service";
import {MessageServices} from "../../services/message.services";
import {StorageModel} from "../../models/storage.model";
import {SizePipe} from '../../services/size.pipe';
import {SortModel} from "../../models/base.model";

@Component({
    selector: 'pbx-storage',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [StorageService],
})

export class StorageComponent implements OnInit {

    constructor(private service: StorageService,
                private message: MessageServices,
                private _size: SizePipe) {

    }

    loading = 0;
    pageInfo: StorageModel = new StorageModel();
    search: string = '';
    source = {
        option: [
            {title: 'Audio', type: 'audio'},
            // {title: 'Call Records', type: 'call_record'},
            // {title: 'Trash', type: 'trash'}
            ],
        select: {title: '', type: ''}
    };
    table = {
        audio: {
            head: [
                {title: 'Name', sort: true, width: null},
                {title: 'Date', sort: true, width: 168},
                {title: 'Size, MB', sort: true, width: 104},
                ],
            key: ['name', 'date', 'size'],
            defaultSort: {isDown: true, column: 'date'}
        },
        // call_record: {
        //     head: [
        //         {title: 'From', sort: true, width: null},
        //         {title: 'To', sort: true, width: null},
        //         {title: 'Start time', sort: true, width: 168},
        //         {title: 'Duration', sort: false, width: 88},
        //         {title: 'Size, Mbyte', sort: false, width: 104},
        //         {title: 'Record', sort: false, width: 200},
        //         {title: '', sort: false, width: 48}],
        //     key: ['from', 'to', 'start', 'duration', 'size'],
        //     defaultSort: {isDown: true, column: 2}
        // },
        // trash: {
        //     head: [
        //         {title: 'Name', sort: true, width: null},
        //         {title: 'Date', sort: true, width: 168},
        //         {title: 'Size, Mbyte', sort: false, width: 104},
        //         {title: '', sort: false, width: 48}],
        //     key: ['name', 'date', 'size'],
        //     defaultSort: {isDown: true, column: 1}
        // },
    };
    sort: SortModel = new SortModel();

    player = {item: [], current: null};
    select = [];
    modal = {
        visible: false,
        text: '',
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };
    searchTimeout = null;
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

    private uploadFiles(files) {
        // console.log('uploadFiles', files);
        for (let i = 0; i < files.length; i++) {
            console.log('uploadFiles', files[i]);
            if (files[i].type === 'audio/mp3' || files[i].type === 'audio/ogg' || files[i].type === 'audio/wav' || files[i].type === 'audio/mpeg' || files[i].type === 'audio/x-wav') {
                this.checkFileExists(files[i]);
            } else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
        }
        this.checkModal();
    }

    private checkModal() {
        if (this.files.length > 0 && !this.modalUpload.visible) {
            this.loading ++;
            this.modalUpload.title = this.files[0].name;
            setTimeout(() => {
                this.modalUpload.visible = true;
            }, 100);
        }
    }

    private checkFileExists(file) {
        const index = this.pageInfo.items.findIndex(item => item.fileName == file.name);
        // console.log('checkFileExists', index);
        if (index != -1) {
            this.files.push(file);
        } else {
            let pageInfo: StorageModel = new StorageModel();
            pageInfo.limit = 1;
            pageInfo.page = 1;
            this.loading++;
            this.service.getList(pageInfo, null, file.name, null).then(res => {
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

    private deleteFileFromQueue() {
        // console.log('deleteFileFromQueue', this.files);
        this.files.splice(0, 1);
        // console.log('deleteFileFromQueue', this.files);
        this.checkModal();
        this.loading--;
    }

    doUploadAction(button) {
        // console.log('doUploadAction', button);
        switch (button.tag) {
            case 1:
                this.uploadFile(this.files[0], 'replace');
                break;
            case 2:
                this.uploadFile(this.files[0], 'new');
                break;
        }
        this.deleteFileFromQueue();
    }

    cancelUploadAction() {
        // console.log('cancelUploadAction')
        this.deleteFileFromQueue();
    }

    selectSource(event) {
        if (event !== this.source.select) {
            this.select = [];
            this.player = {item: [], current: null};
            this.search = '';
            this.source.select = event;
            this.sort.isDown = this.table[this.source.select.type].defaultSort.isDown;
            this.sort.column = this.table[this.source.select.type].defaultSort.column;
            this.getList();
        }
    }

    // totalSize(): number {
    //     let sum = 0;
    //     for (let i = 0; i < this.select.length; i++) {
    //         sum += this.findById(this.fake[this.source.select.type], this.select[i]).size;
    //     }
    //     return sum;
    // }

    time(value: number): string {
        const sec = (value % 60);
        const min = Math.round(value / 60) % 60;
        const hour = Math.round(value / 3600);
        return (hour < 10 ? '0' : '') + hour + ':' + (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    size(value: number): string {
        return (value / (1024 * 1024)).toFixed(1);
    }

    setSort(index: number): void {
        const table = this.table[this.source.select.type];
        if (table.head[index].sort) {
            this.sort.isDown = !(this.sort.column === table.key[index] && this.sort.isDown);
            this.sort.column = table.key[index];
            this.getList();
        }
    }

    selectItem(id: number): void {
        if (this.find(this.select, id)) {
            this.select.splice(this.select.indexOf(id), 1);
        } else {
            this.select.push(id);
        }
    }

    play(id: number): void {
        this.player.current = this.player.current === id ? null : id;
        if (!this.find(this.player.item, id)) {
            this.player.item.push(id);
        }
    }

    findById(array, id) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                return array[i]
            }
        }
        return null;
    }

    clickDeleteIcon(id: number) {
        this.selectItem(id);
        this.modal.visible = true;
    }

    find(array, value): boolean {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }

    dropHandler(e) {
        e.preventDefault();
        if (!this.pageInfo.items) {
            return ;
        }
        const files = e.dataTransfer.files;
        this.uploadFiles(files);
        // console.log('dropHandler', e);
    }

    dragOverHandler(e) {
        e.preventDefault();
        // console.log('dragOverHandler', e);
    }

    dragEndHandler(e) {
        // console.log('dragEndHandler', e);
    }

    dragLeaveHandler(e) {
        e.preventDefault();
        // console.log('dragLeaveHandler', e);
    }

    onSearchKeyUp() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            // console.log('timer');
            this.getList();
            clearTimeout(this.searchTimeout);
        }, 500);
    }

    setPage(page: number) {
        this.pageInfo.page = page;
        this.getList();
    }

    deleteSelected() {
        this.modal.visible = true;
    }

    doDeleteSelected() {
        for (let i = 0; i < this.select.length; i++) {
            const id = this.select[i];
            this.loading++;
            this.service.delete(`/${id}`).then(res => {
                this.loading--;
                if (!this.loading) this.getList();
            }).catch(res => {
                this.loading--;
            });
        }
    }

    sendFile(e) {
        e.preventDefault();
        const files = e.target.files;
        if (e.target.files[0]) {
            this.uploadFiles(files);
        }
    }

    private uploadFile(file, mode) {
        this.loading +=1;
        const formData = new FormData();
        formData.append('type', 'audio');
        formData.append('account_file', file);
        if (mode) formData.append('mode', mode);
        this.service.uploadFile(formData).then(res => {
            // console.log(res);
            this.loading -= 1;
            if (!this.loading) this.getList();
        }).catch(err => {
            // console.log(err);
            this.loading -= 1;
        });
    }

    getSize(value: number) {
        return this._size.transform(value);
    }

    getList() {
        this.loading++;
        this.service.getList(this.pageInfo, this.source.select.type, this.search, this.sort).then(res => {
            this.pageInfo = res;
            this.pageInfo.limit = 10;
            this.loading--;
        }).catch(res => {
            this.loading--;
        });
    }

    ngOnInit(): void {
        this.pageInfo.page = 1;
        this.pageInfo.limit = 10;
        this.selectSource(this.source.option[0]);
    }

}
