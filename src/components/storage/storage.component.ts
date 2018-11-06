import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MediaTableComponent} from '../../elements/pbx-media-table/pbx-media-table.component';
import {ModalEx} from '../../elements/pbx-modal/pbx-modal.component';
import {SizePipe} from '../../services/size.pipe';
import {StorageService} from '../../services/storage.service';
import {MessageServices} from '../../services/message.services';
import {ButtonItem, FilterItem, TableInfoExModel, TableInfoItem, TableInfoAction} from '../../models/base.model';
import {StorageModel, StorageItem} from '../../models/storage.model';
import {killEvent} from '../../shared/shared.functions';


@Component({
    selector: 'pbx-storage',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [StorageService],
})
export class StorageComponent implements OnInit {
    public pageInfo: StorageModel = new StorageModel();
    public table: TableInfoExModel = new TableInfoExModel();
    public loading: number;

    public filters: FilterItem[];
    public buttons: ButtonItem[];
    public currentFilter: any;

    @ViewChild('mediaTable')
    @ViewChild('fileInput') fileInput: ElementRef;
    public mediaTable: MediaTableComponent;

    public modal: ModalEx;
    public sidebarActive: boolean;

    // TODO: ???
    public source = {
        select: {title: '', type: ''}
    };

    private buttonType: number;

    // --- component methods ------------------------------

    constructor(
        public service: StorageService,
        private _message: MessageServices,
        private _size: SizePipe
    ) {
        this.loading = 0;
        this.modal = new ModalEx('', 'deleteFiles');
        this.sidebarActive = false;

        this.table.sort.isDown = false;
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
                {id: 'audio', title: 'Audio'},
                {id: 'call_record', title: 'Call Records'},
                {id: 'voice_mail', title: 'Voice Mail'},
                {id: 'certificate', title: 'Certificate'},
                {id: 'trash', title: 'Trash'},
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
                icon: ''
            },
            {
                id: 1,
                title: 'Delete Selected',
                type: 'error',
                visible: true,
                inactive: true,
                buttonClass: 'trash',
                icon: ''
            },
            {
                id: 2,
                title: 'Upload',
                type: 'success',
                visible: true,
                inactive: false,
                buttonClass: 'button-upload',
                icon: ''
            },
        ];
        this.buttonType = 1;
    }

    ngOnInit() {
        this.pageInfo.limit = Math.floor((window.innerHeight - 180) / 48);
        this.getItems();
    }

    // --- data methods -----------------------------------

    private getItems(): void {
        this.loading++;

        this.service.getItems(this.pageInfo, this.currentFilter, this.table.sort)
            .then(result => {
                this.pageInfo = result;
                this.onMediaDataLoaded();
                this.loading--;
            }).catch((error) => {
            console.log('get items failed', error);
            this.loading--;
        });
    }

    getMediaData(item: StorageItem): void {
        item.record.mediaLoading = true;

        this.service.getMediaData(item.id)
            .then(result => {
                item.record.mediaStream = result.fileLink;
                this.mediaTable.setMediaData(item);
            })
            .catch(error => {
                item.record.mediaLoading = false;
                item.record.playable = false;
            });
    }

    onMediaDataLoaded(): void {
        this.service.select = [];
        this.pageInfo = this.service.pageInfo;
        if (this.currentFilter && this.currentFilter.type && this.currentFilter.type === 'trash') {
            if (this.pageInfo.itemsCount > 0) {
                this.buttons[0].visible = true;
                this.buttons[0].inactive = true;
            } else {
                this.buttons[0].visible = false;
                this.buttons[0].inactive = true;
            }
        } else {
            this.buttons[0].visible = false;
            this.buttons[0].inactive = false;
        }

        this.buttons[1].visible = this.pageInfo.itemsCount > 0;
        this.buttons[1].inactive = this.service.select.length === 0;

        this.buttons[2].inactive = false;
        this.buttons[2].visible = true;
    }

    // --- filter methods ---------------------------------

    reloadFilter(filter: any): void {
        if (filter.type === 'trash') {
            this.buttons[1].title = 'Empty trash';
            this.buttons[1].icon = 'trash';
            this.buttons[0].inactive = true;
        } else {
            this.buttons[1].title = 'Delete Selected';
            this.buttons[1].icon = '';
            this.buttons[0].inactive = true;
        }
        this.currentFilter = filter;
        this.getItems();

    }

    updateFilter(filter: any): void {
        this.currentFilter = filter;
    }

    get activeFilter(): boolean {
        if (this.currentFilter) {
            let keys = Object.keys(this.currentFilter);
            return keys.some(key => this.currentFilter[key] !== undefined && this.currentFilter[key]);
        }
    }

    // --- selection --------------------------------------

    selectItem(item: StorageItem): void {
        this.service.selectItem(item.id);
        this.buttons[0].inactive = this.service.select.length === 0;
        this.buttons[1].inactive = this.service.select.length === 0;
        this.buttons[2].inactive = false;
    }

    // --- file uploading ---------------------------------

    updateLoading(loading, deleting = false) {
        this.loading = loading;
        if (!loading) {
            this.onMediaDataLoaded();
            if (this.service.successCount) {
                let messageText: string;
                if (this.currentFilter !== undefined && this.currentFilter.type === 'trash') {
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

    deleteSelected($event: any) {
        this.buttonType = $event.id;
        if (this.buttonType !== 2) {
            if (this.buttonType === 0) {
                this.modal = new ModalEx('', 'restoreFiles');
            } else {
                this.modal = new ModalEx('', 'deleteFiles');
            }
            this.modal.visible = true;
        } else {
            this.fileInput.nativeElement.click();
        }
    }

    deleteConfirmed() {
        this.service.resetCount();
        this.service.select.forEach(id => {
            let typeDelete: string;
            typeDelete = 'trash';
            if (this.currentFilter && this.currentFilter.type === 'trash') {
                typeDelete = 'delete';
            }
            let item: any;
            item = this.pageInfo.items.find(item => item.id === id);
            // item ? item.loading++ : null;

            if (this.buttonType === 0) {
                this.service.restoreById(id, (loading) => {
                    this.updateLoading(loading, true);
                }, false).then(() => {
                    item ? item.loading-- : null;
                }).catch(() => {
                    item ? item.loading-- : null;
                });
            } else {
                this.service.deleteById(id, (loading) => {
                    this.updateLoading(loading, true);
                }, typeDelete, false).then(() => {
                    item ? item.loading-- : null;
                }).catch(() => {
                    item ? item.loading-- : null;
                });
            }
        });
    }

    deleteItem(item: StorageItem): void {
        this.buttonType = 4;
        let _this = this;
        if (!item) return;

        let typeDelete: string;
        typeDelete = 'trash';
        if (_this.currentFilter && _this.currentFilter.type === 'trash') {
            typeDelete = 'delete';
        }
        this.service.deleteById(item.id, (loading) => {
            _this.updateLoading(loading, true);
        }, typeDelete, false).then(() => {
            item.loading--;
        }).catch(() => {
            item.loading--;
        });
    }
}
