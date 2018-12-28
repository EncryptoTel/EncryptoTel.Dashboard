import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { MediaTableComponent } from '../../elements/pbx-media-table/pbx-media-table.component';
import { ModalEx } from '../../elements/pbx-modal/pbx-modal.component';
import { SizePipe } from '../../services/size.pipe';
import { StorageService } from '../../services/storage.service';
import { MessageServices } from '../../services/message.services';
import { ButtonItem, FilterItem, TableInfoExModel, TableInfoItem, TableInfoAction } from '../../models/base.model';
import { StorageModel, StorageItem } from '../../models/storage.model';
import { killEvent, getMomentFormatDete } from '../../shared/shared.functions';
import { ListComponent } from '@elements/pbx-list/pbx-list.component';
import { Subscription } from 'rxjs/Subscription';
import { WsServices } from '@services/ws.services';
import { HeaderComponent } from '@elements/pbx-header/pbx-header.component';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageServices } from '@services/local-storage.services';
import { formatDateTime } from '@shared/shared.functions';


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
    buttonsAudio: ButtonItem[];
    currentFilter: any;
    deletable: boolean = true;

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
    dateFormat: any;

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
        public translate: TranslateService,
        private storage: LocalStorageServices
    ) {
        this.dateFormat = getMomentFormatDete(this.storage.readItem('dateTimeFormat'), this.storage.readItem('TimeFormat'));
        this.modal = new ModalEx('', 'deleteFiles');
        this.sidebarActive = false;

        this.table.sort.isDown = true;
        this.table.sort.column = 'date';
        this.table.items = [
            new TableInfoItem(this.translate.instant('Name'), 'name', 'name', null, 120),
            new TableInfoItem(this.translate.instant('Date'), 'displayDateTime', 'date', 158),
            new TableInfoItem(this.translate.instant('Time'), 'durationFormat', 'duration', 50),
            new TableInfoItem(this.translate.instant('Size, Mbyte'), 'size', 'size', 50),
            new TableInfoItem(this.translate.instant('Record'), 'record', null, 200, 0, true),
        ];
        this.table.actions = [
            new TableInfoAction(1, 'player', 175),
        ];

        this.filters = [
            new FilterItem(1, 'type', this.translate.instant('Source:'), [
                { id: 'audio', title: this.translate.instant('Sound files') },
                { id: 'call_record', title: this.translate.instant('Call Records') },
                // {id: 'voice_mail', title: this.translate.instant('Voice Mail')},
                { id: 'certificate', title: this.translate.instant('Certificate') },
                { id: 'trash', title: this.translate.instant('Trash') },
            ], 'title', this.translate.instant('[choose one]')),
            new FilterItem(2, 'search', 'Search:', null, null, this.translate.instant('Search by Name')),
        ];
        this.buttonsAudio = [
            {
                id: 2,
                title: 'Upload',
                type: 'success',
                visible: true,
                inactive: true,
                buttonClass: 'button-upload',
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
            }
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
                id: 4,
                title: 'Download',
                type: 'accent',
                visible: true,
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

    getButton(id) {
        return this.buttons.find(x => x.id === id);
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
        });
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
                this.pageInfo.items.forEach(storageItem => {
                    storageItem.created = formatDateTime(storageItem.created, this.dateFormat);
                    if (storageItem.callDetail) {
                        storageItem.from = storageItem.callDetail.source;
                        storageItem.to = storageItem.callDetail.destination;
                    }

                });
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
                this.getButton(0).visible = true;
                this.getButton(0).inactive = true;
                this.getButton(3).inactive = false;
            }
            else {
                this.getButton(0).visible = false;
                this.getButton(0).inactive = true;
                this.getButton(3).inactive = true;
            }
        }
        else {
            this.getButton(0).visible = false;
            this.getButton(0).inactive = false;
            this.getButton(1).inactive = true;
        }
        this.getButton(2).inactive = !this.isSidebarVisible;
        this.getButton(2).visible = this.currentFilter && this.currentFilter.type === 'audio';
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
            this.table.items[1] = new TableInfoItem(this.translate.instant('Date'), 'displayModifiedDate', 'date', 168);
            this.getButton(3).visible = true;
            this.getButton(1).visible = false;
            this.getButton(1).inactive = true;
            this.getButton(0).inactive = true;
        } else if (filter.type === 'certificate') {
            this.getButton(3).visible = false;
            this.getButton(2).visible = false;
            this.getButton(1).visible = false;
            this.getButton(0).visible = false;
        }
        else {
            this.table.items[1] = new TableInfoItem(this.translate.instant('Date'), 'displayDateTime', 'date', 168);
            this.getButton(3).visible = false;
            this.getButton(1).visible = true;
            this.getButton(0).inactive = true;
        }

        this.updateFilter(filter);
        this.getItems();
        this.loading--;
    }

    updateFilter(filter: any): void {
        this.currentFilter = filter;
        if (filter.type === 'call_record') {
            this.deletable = true;
            this.table.items = [
                new TableInfoItem(this.translate.instant('From'), 'from', null, 120),
                new TableInfoItem(this.translate.instant('To'), 'to', null, 120),
                new TableInfoItem(this.translate.instant('Start time'), 'displayDateTime', 'date', 158),
                new TableInfoItem(this.translate.instant('Time'), 'durationFormat', 'duration', 50),
                new TableInfoItem(this.translate.instant('Size, Mbyte'), 'size', 'size', 50),
                new TableInfoItem(this.translate.instant('Record'), 'record', null, 200, 0, true),
            ];
        } else if (filter.type === 'certificate') {
            this.deletable = false;
            this.table.items = [
                new TableInfoItem(this.translate.instant('Name'), 'name', 'name', null, 120),
                new TableInfoItem(this.translate.instant('Date'), 'displayDateTime', 'date', 158),
                new TableInfoItem(this.translate.instant('Size, Mbyte'), 'sizeKb', 'size', 50),
            ];
        } else {
            this.deletable = true;
            this.table.items = [
                new TableInfoItem(this.translate.instant('Name'), 'name', 'name', null, 120),
                new TableInfoItem(this.translate.instant('Date'), 'displayDateTime', 'date', 158),
                new TableInfoItem(this.translate.instant('Time'), 'durationFormat', 'duration', 50),
                new TableInfoItem(this.translate.instant('Size, Mbyte'), 'size', 'size', 50),
                new TableInfoItem(this.translate.instant('Record'), 'record', null, 200, 0, true),
            ];
        }
    }

    // --- selection --------------------------------------

    selectItem(item: StorageItem): void {
        this.service.selectItem(item.id);
        this.getButton(0).inactive = this.service.select.length === 0;
        this.getButton(1).inactive = this.service.select.length === 0;
        this.getButton(4).inactive = this.service.select.length === 0;
        this.getButton(2).inactive = false;
    }

    // --- file uploading ---------------------------------

    updateLoading(loading, deleting = false) {
        this.loading = loading;
        if (!loading) {
            this.onMediaDataLoaded();
            if (this.service.successCount) {
                let messageText: string = '';
                let action: string = '';
                if (this.isFilterTrashSelected) {
                    if (this.buttonType === 0) {
                        action = deleting ? this.translate.instant('restored') : this.translate.instant('uploaded');
                        if (this.service.successCount > 1) {
                            messageText = this.translate.instant('files have been successfully') + ' ' + action + '.';
                        } else {
                            messageText = this.translate.instant('file has been successfully') + ' ' + action + '.';
                        }
                    } else {
                        action = deleting ? this.translate.instant('delete') : this.translate.instant('uploaded');
                        if (this.service.successCount > 1) {
                            messageText = this.translate.instant('files have been successfully') + ' ' + action + '.';
                        } else {
                            messageText = this.translate.instant('file has been successfully') + ' ' + action + '.';
                        }
                    }
                } else {
                    if (this.service.successCount > 1) {
                        action = deleting ? this.translate.instant('trasheds') : this.translate.instant('uploaded');
                        messageText = this.translate.instant('files have been successfully') + ' ' + action + '.';
                    } else {
                        action = deleting ? this.translate.instant('trashed') : this.translate.instant('uploaded');
                        messageText = this.translate.instant('file has been successfully') + ' ' + action + '.';
                    }
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
                this._message.writeError(this.translate.instant('Accepted formats: mp3, ogg, wav'));
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

    headerClickHandler(event: any) {
        this.buttonType = event.id;
        if (event.id === 4) {
            this.downloadFile();
        } else {
            this.deleteSelected();
        }

    }

    deleteSelected() {
        this.confirmDeletion();
    }

    downloadFile() {
        if (this.service.select.length > 0) {
            for (let index = 0; index < this.service.select.length; index++) {
                this.service.downloadFile(this.service.select[index]);
            }
        }
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
        this.modal.title = this.translate.instant(this.modal.title);
        if (this.buttonType === 1) {
            this.modal = new ModalEx('', 'deleteFiles');
            if (this.service.select.length === 1) {
                let item: StorageItem = this.pageInfo.items.find(i => i.id === this.service.select[0]);
                item = this.getShortName(item);
                this.modal.body = this.translate.instant('Are you sure you want to delete') + '<span>' + item.fileName + '</span> ' + this.translate.instant('file?');
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
                this.modal.body = this.translate.instant('Permanently delete') + '&nbsp;' + item.fileName + '&nbsp;' + this.translate.instant('file?');
            }
            else if (this.service.select.length > 0) {
                this.modal.body = 'Permanently delete' + '&nbsp;' +  this.service.select.length + '&nbsp;' + 'file(s)?';
            }
            this.modal.visible = true;
        }
        else {
            this.modal = new ModalEx('', 'restoreFiles');
            this.modal.title = this.translate.instant(this.modal.title);
            this.modal.body = this.translate.instant(this.modal.body);
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
            if (this.buttonType === 3) {
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
