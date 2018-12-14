import {Component, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {DatePipe} from '@angular/common';
import {FadeAnimation} from '../../shared/fade-animation';
import {PlayerAnimation} from '../../shared/player-animation';
import {CdrService} from '../../services/cdr.service';
import {WsServices} from '../../services/ws.services';
import {CdrItem, CdrModel} from '../../models/cdr.model';
import {getInterval, getDateRange, dateToServerFormat} from '../../shared/shared.functions';
import {TableInfoAction, TableInfoActionOption, TableInfoExModel, TableInfoItem, TagModel} from '../../models/base.model';
import {MediaTableComponent} from '../../elements/pbx-media-table/pbx-media-table.component';
import {TagSelectorComponent} from '../../elements/pbx-tag-selector/pbx-tag-selector.component';
import {StorageService} from '../../services/storage.service';
import {AddressBookService} from '@services/address-book.service';
import {ModalEx} from '@elements/pbx-modal/pbx-modal.component';
import {MessageServices} from '@services/message.services';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-details-and-records',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        FadeAnimation('200ms'),
        PlayerAnimation
    ]
})
export class DetailsAndRecordsComponent implements OnInit {
    pageInfo: CdrModel = new CdrModel();
    cdrSubscription: Subscription;
    table: TableInfoExModel = new TableInfoExModel();
    loading = 0;
    tags: TagModel[];

    startDate: string;
    endDate: string;
    downloadFile: any;
    modalBlock: ModalEx;

    blockItem: any;
    unblockItem: any;

    @ViewChild('mediaTable') mediaTable: MediaTableComponent;
    @ViewChild('tagSelector') tagSelector: TagSelectorComponent;

    // -- component lifecycle methods -----------------------------------------

    constructor(private service: CdrService,
                private ws: WsServices,
                private storageService: StorageService,
                private addressBookService: AddressBookService,
                protected message: MessageServices,
                public translate: TranslateService) {

        this.table.sort.isDown = true;
        this.table.sort.column = 'callDate';
        this.table.items.push(new TableInfoItem(this.translate.instant('From'), 'source', 'source'));
        this.table.items.push(new TableInfoItem(this.translate.instant('To'), 'destination', 'destination'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Date'), 'displayDateTime', 'callDate'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Duration'), 'displayDuration'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Tag'), 'displayStatus', 'status'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Price'), 'displayPrice'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Record'), 'record', null, 200, 0));
        this.table.actions.push(new TableInfoAction(1, 'player', 175));
        this.table.actions.push(new TableInfoAction(2, 'drop-down', 25));

        this.cdrSubscription = this.ws.subCdr().subscribe(() => {
            const item = new CdrItem();
            this.pageInfo.items.unshift(item);
            this.getItems(item);
        });

        this.startDate = undefined;
        this.endDate = undefined;

        this.modalBlock = new ModalEx('', 'block');

        this.tags = [
            {key: 'noAnswer', title: this.translate.instant('no-answer'), selected: false},
            {key: 'incoming', title: this.translate.instant('incoming'), selected: true},
            {key: 'outgoing', title: this.translate.instant('outgoing'), selected: true},
            {key: 'missed', title: this.translate.instant('missed'), selected: false},
            {key: 'record', title: this.translate.instant('record'), selected: false},
        ];
    }

    ngOnInit() {
        this.pageInfo.limit = Math.floor((window.innerHeight - 180) / 48);
        this.getItems();
    }

    // -- event handlers ------------------------------------------------------

    getInterval(): string {
        return getInterval(this.pageInfo.items, 'created', 'displayDate');
    }

    formatDate(value: Date): string {
        const formatPipe = new DatePipe('en-US');
        return formatPipe.transform(value, 'yyyy-MM-dd');
    }

    dateChanged(range: string[]): void {
        this.startDate = dateToServerFormat(range[0]);
        this.endDate = dateToServerFormat(range[1]);
        this.getItems();
    }

    dropDown(event) {
        switch (event.action.id) {
            case 2:
                event.action.options = [];
                if (event.item.accountFile && event.item.accountFile.id > 0) {
                    event.action.options.push(new TableInfoActionOption(1, this.translate.instant('Download file')));
                }
                // if (event.item.contactId) {
                //     event.action.options.push(new TableInfoActionOption(2, 'View contact'));
                // } else {
                //     event.action.options.push(new TableInfoActionOption(5, 'Create contact'));
                // }
                if (event.item.contact && event.item.contact.blacklist) {
                    event.action.options.push(new TableInfoActionOption(4, this.translate.instant('Unblock user'), 'ban'));
                } else {
                    event.action.options.push(new TableInfoActionOption(3, this.translate.instant('Block user'), 'ban'));
                }
                break;
        }
    }

    dropDownClick(event) {
        switch (event.action.id) {
            case 2:
                switch (event.option.id) {
                    case 1:
                        this.getFile(event.item.accountFile.id);
                        break;
                    case 2:
                        console.log('contact view');
                        break;
                    case 3:
                        this.blockItem = undefined;
                        this.blockItem = event.item;
                        this.block();
                        break;
                    case 4:
                        this.unblockItem = undefined;
                        this.unblockItem = event.item;
                        this.unblock();
                        break;
                }
                break;
        }
    }

    block() {
        this.modalBlock = new ModalEx('', this.blockItem ? this.translate.instant('block') : '');
        // this.modalBlock.title = this.translate.instant(this.modalBlock.title);
        // this.modalBlock.body = this.translate.instant(this.modalBlock.body);
        this.modalBlock.show();
    }

    unblock() {
        this.modalBlock = new ModalEx('', this.unblockItem ? this.translate.instant('unblock') : '');
        // this.modalBlock.title = this.translate.instant(this.modalBlock.title);
        // this.modalBlock.body = this.translate.instant(this.modalBlock.body);
        this.modalBlock.show();
    }

    confirmBlock() {
        console.log('block');
        if (this.blockItem) {
            if (this.blockItem.contactId === null) {
                const phoneNumber = this.blockItem.source;
                this.addressBookService.blockByPhone(phoneNumber).then(res => {
                    this.blockItem = undefined;
                    this.message.writeSuccess('Contact blocked successfully');
                    this.getItems();
                }).catch(() => {}).then(() => {});
            } else {
                this.addressBookService.blockByContact(this.blockItem.contact.id).then(res => {
                    this.blockItem = undefined;
                    this.message.writeSuccess('Contact blocked successfully');
                    this.getItems();
                }).catch(() => {}).then(() => {});
            }
        }
        if (this.unblockItem) {
            this.addressBookService.blockByContact(this.unblockItem.contact.id, true).then(res => {
                this.unblockItem = undefined;
                this.message.writeSuccess('Contact unblocked successfully');
                this.getItems();
            }).catch(() => {}).then(() => {});
        }
    }

    getFile(fileId) {
        if (fileId) {
            this.storageService.getById(fileId).then(response => {
                this.downloadFile = response;
                let url: string;
                url = '/download/' + this.downloadFile.downloadHash;
                let a: any;
                a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = url;
                a.click();
                a.remove();
            }).catch(() => {
            }).then(() => {
            });
        }
    }

    onTagSelection(): void {
        this.getItems();
    }

    // -- data retrieval methods ----------------------------------------------

    private getItems(item = null): void {
        (item ? item : this).loading++;
        const tags = this.tagSelector.selectedTags.map(t => {
            return t.key;
        });
        this.service.getItems(
            this.pageInfo,
            {status: tags.length > 0 ? tags : null, startDate: this.startDate, endDate: this.endDate},
            this.table.sort)
            .then(result => {
                this.pageInfo = result;
            })
            .catch(() => {
            })
            .then(() => (item ? item : this).loading--);
    }

    getMediaData(item: CdrItem): void {
        item.record.mediaLoading = true;

        this.service.getMediaData(item.accountFile.id)
            .then(result => {
                item.record.mediaStream = result.fileLink;
                this.mediaTable.setMediaData(item);
            })
            .catch(error => {
                console.log(error);
                item.record.mediaLoading = false;
                item.record.playable = false;
            });
    }
}
