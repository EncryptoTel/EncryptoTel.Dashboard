import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../services/storage.service";
import {MessageServices} from "../../services/message.services";
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
    modal = {
        visible: false,
        text: '',
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };
    searchTimeout = null;

    private uploadFiles(files) {
        // console.log('uploadFiles', files);
        for (let i = 0; i < files.length; i++) {
            // console.log('uploadFiles', files[i]);
            if (this.service.checkCompatibleType(files[i])) {
                this.service.checkFileExists(files[i]);
            } else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
        }
        this.service.checkModal();
    }

    selectSource(event) {
        if (event !== this.source.select) {
            this.service.select = [];
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
        this.service.selectItem(id);
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
        if (!this.service.pageInfo.items) {
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
        this.service.pageInfo.page = page;
        this.getList();
    }

    deleteSelected() {
        this.modal.visible = true;
    }

    doDeleteSelected() {
        for (let i = 0; i < this.service.select.length; i++) {
            const id = this.service.select[i];
            this.service.deleteById(id);
        }
    }

    sendFile(e) {
        e.preventDefault();
        const files = e.target.files;
        if (e.target.files[0]) {
            this.uploadFiles(files);
        }
    }

    getSize(value: number) {
        return this._size.transform(value);
    }

    getList() {
        this.service.getList(this.source.select.type, this.search, this.sort);
    }

    ngOnInit(): void {
        this.selectSource(this.source.option[0]);
    }

}
