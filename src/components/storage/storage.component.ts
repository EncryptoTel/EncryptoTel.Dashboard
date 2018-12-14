import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { MediaTableComponent } from '../../elements/pbx-media-table/pbx-media-table.component';
import { ModalEx } from '../../elements/pbx-modal/pbx-modal.component';
import { SizePipe } from '../../services/size.pipe';
import { StorageService } from '../../services/storage.service';
import { MessageServices } from '../../services/message.services';
import { ButtonItem, FilterItem, TableInfoExModel, TableInfoItem, TableInfoAction } from '../../models/base.model';
import { StorageModel, StorageItem } from '../../models/storage.model';
import { killEvent } from '../../shared/shared.functions';
import { ListComponent } from '@elements/pbx-list/pbx-list.component';
import { Subscription } from 'rxjs/Subscription';
import { WsServices } from '@services/ws.services';
import { HeaderComponent } from '@elements/pbx-header/pbx-header.component';


@Component({
    selector: 'pbx-storage',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [StorageService],
})
export class StorageComponent implements OnInit, AfterViewChecked, OnDestroy {

    uploadedFile: Subscription;
    pageInfo: StorageModel = new StorageModel();
    table: TableInfoExModel = new TableInfoExModel();
    loading: number = 0;

    filters: FilterItem[];
    buttons: ButtonItem[];
    currentFilter: any;

    storageItemSubscription: Subscription;

    @ViewChild('mediaTable')
    @ViewChild('fileInput') fileInput: ElementRef;
    @ViewChild(HeaderComponent) header: HeaderComponent;
    @ViewChild(MediaTableComponent) mediaTable: MediaTableComponent;
    // public mediaTable: MediaTableComponent;

    modal: ModalEx;
    sidebarActive: boolean = false;
    pageLoaded: boolean = false;

    private buttonType: number;

    // --- properties -------------------------------------

    get isEmptySearch(): boolean {
        // !loading && activeFilter && pageInfo.itemsCount === 0
        const isLoading: boolean = !!this.loading;
        const filteredWithSearch: boolean = this.activeFilter
            && this.currentFilter
            && this.currentFilter.hasOwnProperty('search')
            && this.currentFilter.search;
        return !isLoading && filteredWithSearch && this.pageInfo.itemsCount === 0;
    }

    get isSidebarVisible(): boolean {
        return !!(this.currentFilter && this.currentFilter.type && this.currentFilter.type === 'audio');
    }

    get isNothingFound(): boolean {
        // !loading && !activeFilter && pageInfo.itemsCount === 0
        const isLoading: boolean = !!this.loading;
        const filteredWithoutSearch: boolean = this.activeFilter
            && this.currentFilter
            && (!this.currentFilter.hasOwnProperty('search') || !this.currentFilter.search);
        return !isLoading && filteredWithoutSearch && this.pageInfo.itemsCount === 0;
    }

    get isPaginationVisible(): boolean {
        // !loading && !loadingEx && !filter.loading && pageInfo.itemsCount > 0
        const isLoading: boolean = !!this.loading;
        return !isLoading && this.pageInfo.itemsCount > 10;
    }

    get isFilterTrashSelected(): boolean {
        return !!(this.currentFilter && this.currentFilter.type && this.currentFilter.type === 'trash');
    }

    get deletionType(): string {
        return this.isFilterTrashSelected ? 'delete' : 'trash';
    }

    // --- component methods ------------------------------

    constructor(
        public service: StorageService,
        private _message: MessageServices,
        private _size: SizePipe,
        private _ws: WsServices,
    ) {
        this.modal = new ModalEx('', 'deleteFiles');
        this.sidebarActive = false;

        this.table.sort.isDown = true;
        this.table.sort.column = 'date';
        this.table.items = [
            new TableInfoItem('Name', 'name', 'name'),
            new TableInfoItem('Date', 'displayDateTime', 'date', 168),
            new TableInfoItem('Size, MB', 'size', 'size', 104),
            new TableInfoItem('Record', 'record', null, 200, 0, true),
        ];
        this.table.actions = [
            new TableInfoAction(1, 'player', 175),
        ];

        this.filters = [
            new FilterItem(1, 'type', 'Source:', [
                { id: 'audio', title: 'Audio' },
                { id: 'call_record', title: 'Call Records' },
                // {id: 'voice_mail', title: 'Voice Mail'},
                { id: 'certificate', title: 'Certificate' },
                { id: 'trash', title: 'Trash' },
            ], 'title', '[choose one]'),
            new FilterItem(2, 'search', 'Search:', null, null, 'Search by Name'),
        ];

        this.buttons = [
            {
                id: 0,
                title: 'Restore Selected',
                type: 'accent',
                visible: false,
                inactive: true,
                buttonClass: '',
                icon: false
            },
            {
                id: 1,
                title: 'Delete Selected',
                type: 'error',
                visible: true,
                inactive: true,
                buttonClass: 'trash',
                icon: false
            },
            {
                id: 3,
                title: 'Empty trash',
                type: 'error',
                visible: false,
                inactive: false,
                buttonClass: 'trash',
                icon: 'trash'
            },
            {
                id: 2,
                title: 'Upload',
                type: 'success',
                visible: true,
                inactive: true,
                buttonClass: 'button-upload',
                icon: false
            }
        ];
        this.buttonType = 1;
    }

    ngOnInit() {
        const $this: StorageComponent = this;
        this.pageInfo.limit = Math.floor((window.innerHeight - 180) / 48);
        this.currentFilter = {
            'type': 'audio'
        };
        this.getItems();
        this.storageItemSubscription = this._ws.updateStorageItem().subscribe(result => {
            let storageItem: any;
            storageItem = $this.pageInfo.items.find(item => item.id === result.id);
            if (result.converted === 1) {
                storageItem.converted = result.converted;
            }
        });

        this.uploadedFile = this.service.uploadedFile.subscribe(() => {
            this.getItems();
        })
    }

    ngAfterViewChecked() {
        if (this.header && !this.pageLoaded) {
            this.pageLoaded = true;
            this.header.selectedFilter[0] = this.filters[0].options[0];
            this.header.inputs.first.objectView = this.filters[0].options[0];
            this.header.inputs.first.value = this.filters[0].options[0];
        }
    }

    // --- data methods -----------------------------------

    private getItems(): void {
        this.loading++;

        this.service.getItems(this.pageInfo, this.currentFilter, this.table.sort)
            .then(response => {
                this.pageInfo = response;
                this.onMediaDataLoaded();
            })
            .catch((error) => {
                console.log('get items failed', error);
            })
            .then(() => this.loading = 0);
    }

    getMediaData(item: StorageItem): void {
        item.record.mediaLoading = true;

        this.service.getMediaData(item.id)
            .then(result => {
                item.record.mediaStream = result.fileLink;
                this.mediaTable.setMediaData(item);
            })
            .catch(() => {
                item.record.mediaLoading = false;
                item.record.playable = false;
            });
    }

    onMediaDataLoaded(): void {
        this.service.select = [];
        this.pageInfo = this.service.pageInfo;
        if (this.isFilterTrashSelected) {
            if (this.pageInfo.itemsCount > 0) {
                this.buttons[0].visible = true;
                this.buttons[0].inactive = true;
                this.buttons[2].inactive = false;
            }
            else {
                this.buttons[0].visible = false;
                this.buttons[0].inactive = true;
                this.buttons[2].inactive = true;
            }
        }
        else {
            this.buttons[0].visible = false;
            this.buttons[0].inactive = false;
            this.buttons[1].inactive = true;
        }

        this.buttons[3].inactive = !this.isSidebarVisible;
        this.buttons[3].visible = true;
    }

    // --- filter methods ---------------------------------

    get activeFilter(): boolean {
        if (this.currentFilter) {
            const keys = Object.keys(this.currentFilter);
            return keys.some(key => this.currentFilter[key] !== undefined && this.currentFilter[key]);
        }
    }

    reloadFilter(filter: any): void {
        this.loading++;
        if (filter.type === 'trash') {
            this.buttons[2].visible = true;
            this.buttons[1].visible = false;
            this.buttons[1].inactive = true;
            this.buttons[0].inactive = true;
        }
        else {
            this.buttons[2].visible = false;
            this.buttons[1].visible = true;
            this.buttons[0].inactive = true;
        }
        this.currentFilter = filter;
        this.getItems();
        this.loading--;
    }

    updateFilter(filter: any): void {
        this.currentFilter = filter;
    }

    // --- selection --------------------------------------

    selectItem(item: StorageItem): void {
        this.service.selectItem(item.id);
        this.buttons[0].inactive = this.service.select.length === 0;
        this.buttons[1].inactive = this.service.select.length === 0;
        this.buttons[3].inactive = false;
    }

    // --- file uploading ---------------------------------

    updateLoading(loading, deleting = false) {
        this.loading = loading;
        if (!loading) {
            this.onMediaDataLoaded();
            if (this.service.successCount) {
                let messageText: string;
                if (this.isFilterTrashSelected) {
                    if (this.buttonType === 0) {
                        messageText = this.service.successCount > 1
                            ? `${this.service.successCount} files have been successfully ${deleting ? 'restored' : 'uploaded'}.`
                            : `${this.service.successCount} file has been successfully ${deleting ? 'restored' : 'uploaded'}.`;
                    } else {
                        messageText = this.service.successCount > 1
                            ? `${this.service.successCount} files have been successfully ${deleting ? 'deleted' : 'uploaded'}.`
                            : `${this.service.successCount} file has been successfully ${deleting ? 'deleted' : 'uploaded'}.`;
                    }
                } else {
                    messageText = this.service.successCount > 1
                        ? `${this.service.successCount} files have been successfully ${deleting ? 'trashed' : 'uploaded'}.`
                        : `${this.service.successCount} file has been successfully ${deleting ? 'trashed' : 'uploaded'}.`;
                }
                this._message.writeSuccess(messageText);
            }
            this.sidebarActive = false;
        }
    }

    private uploadFiles(files) {
        this.service.resetCount();
        for (let i = 0; i < files.length; i++) {
            if (this.service.checkCompatibleType(files[i])) {
                this.service.checkFileExists(
                    files[i],
                    (loading) => {
                        this.updateLoading(loading);
                    });
            }
            else {
                this._message.writeError('Accepted formats: mp3, ogg, wav');
                this.sidebarActive = false;
            }
        }
        this.service.checkModal();
    }

    dropHandler(event) {
        event.preventDefault();
        // TODO: strange things. needs to be clarified.
        if (!this.service.pageInfo.items) {
            return;
        }
        const files = event.dataTransfer.files;
        this.uploadFiles(files);
    }

    dragOverHandler(event): void {
        this.sidebarActive = true;
        event.preventDefault();
    }

    dragEndHandler(event): void {
    }

    dragLeaveHandler(event): void {
        this.sidebarActive = false;
        event.preventDefault();
    }

    sendFile(event) {
        killEvent(event);
        const files = event.target.files;
        if (event.target.files[0]) {
            this.uploadFiles(files);
        }
    }

    // --- file deletion methods --------------------------

    deleteSelected(event: any) {
        this.buttonType = event.id;
        this.confirmDeletion();
    }

    deleteItem(item: StorageItem): void {
        if (!item) return;
        this.buttonType = this.isFilterTrashSelected ? 3 : 1;
        this.service.select = [item.id];
        this.confirmDeletion();
    }

    getShortName(item) {
        let name = item.fileName;
        let reg = /\.[a-z \d]{2,5}$/;
        let ext = name.match(reg)[0];
        let long = name.split(ext)[0];
        var short;
        var dots = '..';
        if (long.length > 20) {
            short = long.substr(0, 20);
        } else {
            short = long;
            dots = '';
        }
        item.fileName = short + dots + ext;
        return item;
    }

    confirmDeletion(): void {
        if (this.buttonType === 1) {
            this.modal = new ModalEx('', 'deleteFiles');
            if (this.service.select.length === 1) {
                let item: StorageItem = this.pageInfo.items.find(i => i.id === this.service.select[0]);
                item = this.getShortName(item);
                this.modal.body = 'Are you sure you want to delete <span>' + item.fileName + '</span> file?';
            }
            this.modal.visible = true;
        }
        else if (this.buttonType === 2) {
            this.fileInput.nativeElement.click();
        }
        else if (this.buttonType === 3) {
            this.modal = new ModalEx('', 'emptyTrash');
            if (this.service.select.length === 1) {
                let item: StorageItem = this.pageInfo.items.find(i => i.id === this.service.select[0]);
                item = this.getShortName(item);
                this.modal.body = 'Permanently delete ' + item.fileName + ' file?';
            }
            else if (this.service.select.length > 0) {
                this.modal.body = 'Permanently delete ' + this.service.select.length + ' file(s)?';
            }
            this.modal.visible = true;
        }
        else {
            this.modal = new ModalEx('', 'restoreFiles');
            this.modal.visible = true;
        }
    }

    deleteConfirmed() {
        this.service.resetCount();
        if (this.service.select.length > 0) {
            this.service.select.forEach(id => {
                const item: any = this.pageInfo.items.find(i => i.id === id);
                // item ? item.loading++ : null;
                if (this.buttonType === 0) {
                    this.service.restoreById(id, (loading) => {
                        this.updateLoading(loading, true);
                    }, false)
                        .then(() => { })
                        .catch(() => { })
                        .then(() => { if (!!item) item.loading--; });
                }
                else {
                    this.service.deleteById(id, (loading) => {
                        this.updateLoading(loading, true);
                    }, this.deletionType, false)
                        .then(() => { })
                        .catch(() => { })
                        .then(() => { if (!!item) item.loading--; });
                }
            });
        }
        else {
            if (this.buttonType === 2) {
                this.service.deleteAll((loading) => {
                    this.updateLoading(loading, true);
                }, false)
                    .then(() => { })
                    .catch(() => { });
            }
        }
    }

    ngOnDestroy(): void {
        this.uploadedFile.unsubscribe();
    }
}
