import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../services/storage.service";
import {MessageServices} from "../../services/message.services";
import {StorageModel} from "../../models/storage.model";
import {SizePipe} from '../../services/size.pipe';

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
                {title: 'Name', sort: false, width: null},
                {title: 'Date', sort: false, width: 168},
                {title: 'Size, Mbyte', sort: false, width: 104},
                ],
            key: ['name', 'date', 'size'],
            defaultSort: {isDown: true, column: 1}
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
    sort = {isDown: true, column: -1};

    player = {item: [], current: null};
    select = [];
    modal = {
        visible: false,
        text: '',
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };
    searchTimeout = null;

    selectSource(event) {
        if (event !== this.source.select) {
            this.select = [];
            this.player = {item: [], current: null};
            this.search = '';
            this.source.select = event;
            this.sort = this.table[this.source.select.type].defaultSort;
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
        if (this.table[this.source.select.type].head[index].sort) {
            this.sort.isDown = !(this.sort.column === index && this.sort.isDown);
            this.sort.column = index;
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
        const files = e.dataTransfer.files;
        this.uploadFile(files);
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
            this.uploadFile(files);
        }
    }

    private uploadFile(files) {
        for (let i = 0; i < files.length; i++) {
            if (files[i].type === 'audio/mp3' || files[i].type === 'audio/ogg' || files[i].type === 'audio/wav' || files[i].type === 'audio/mpeg' || files[i].type === 'audio/x-wav') {
                this.loading +=1;
                const formData = new FormData();
                formData.append('account_file_type', 'audio');
                formData.append('account_file', files[i]);
                this.service.uploadFile(formData).then(res => {
                    // console.log(res);
                    this.loading -= 1;
                    if (!this.loading) this.getList();
                }).catch(err => {
                    // console.log(err);
                    this.loading -= 1;
                });
            } else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
        }
    }

    getSize(value: number) {
        return this._size.transform(value);
    }

    getList() {
        this.loading++;
        this.service.getList(this.pageInfo, this.source.select.type, this.search).then(res => {
            this.pageInfo = res;
            this.pageInfo.limit = 10;
            this.loading--;
        }).catch(res => {
            this.loading--;
        });
    }

    ngOnInit(): void {
        this.source.select = this.source.option[0];
        this.pageInfo.page = 1;
        this.pageInfo.limit = 10;
        this.getList();
    }

}
