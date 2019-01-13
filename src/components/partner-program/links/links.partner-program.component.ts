import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PartnerProgramService } from '@services/partner-program.service';
import { PartnerProgramItem, PartnerProgramModel } from '@models/partner-program.model';
import { TableInfoExModel, TableInfoItem } from '@models/base.model';
import { Lockable, Locker } from '@models/locker.model';
import { FadeAnimation } from '@shared/fade-animation';
import { killEvent } from '@shared/shared.functions';
import { ModalEx } from '@elements/pbx-modal/pbx-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { MessageServices } from '@services/message.services';


@Component({
    selector: 'links-partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [PartnerProgramService]
})
export class LinksPartnerProgramComponent implements OnInit, Lockable {
    table: TableInfoExModel;
    selected: PartnerProgramItem;

    modalDelete: ModalEx;
    locker: Locker;

    @Input() partners: PartnerProgramModel;

    @Output() onReload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelect: EventEmitter<PartnerProgramItem> = new EventEmitter();
    @Output() onEdit: EventEmitter<PartnerProgramItem> = new EventEmitter();
    @Output() onCopyToClipboard: EventEmitter<PartnerProgramItem> = new EventEmitter();

    // -- properties ----------------------------------------------------------

    get tableSortOrder(): any {
        return this.table ? this.table.sort : null;
    }

    get tableHasData(): boolean {
        return this.partners ? this.partners.items.length > 0 : false;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(
        private service: PartnerProgramService,
        private translate: TranslateService,
        private messages: MessageServices
    ) {
        this.locker = new Locker();

        this.table = new TableInfoExModel();
        this.table.sort.isDown = false;
        this.table.sort.column = 'name';
        this.table.items = [
            new TableInfoItem('Name', 'name', 'name'),
            new TableInfoItem('Link', 'refLink', 'refLink'),
            new TableInfoItem('Status', 'status', 'status'),
            new TableInfoItem('Visited', 'visited', 'visited'),
            new TableInfoItem('Registered', 'registered', 'registered'),
            new TableInfoItem('Rewards Summary', 'totalBonus', 'totalBonus'),
        ];

        this.modalDelete = new ModalEx(
            this.translate.instant('Are you sure you want to delete this link?'),
            'delete');
    }

    ngOnInit(): void {
    }

    // -- event handlers ------------------------------------------------------

    reload(item) {
        this.onReload.emit(item);
    }

    changePage(page: number) {
        this.partners.page = page;
        this.onReload.emit();
    }

    selectLimit(limit: number) {
        this.partners.limit = limit;
        this.partners.page = 1;
        this.onReload.emit();
    }

    select(item: PartnerProgramItem) {
        this.onSelect.emit(item);
    }

    edit(item: PartnerProgramItem) {
        this.onEdit.emit(item);
    }

    delete(item: PartnerProgramItem) {
        this.selected = item;
        this.modalDelete.title = item.name;
        this.modalDelete.show();
    }

    clickCreateLink() {
        const item = new PartnerProgramItem();
        this.onEdit.emit(item);
    }

    copyToClipboard(item: PartnerProgramItem, event: MouseEvent): void {
        this.onCopyToClipboard.emit(item);
        killEvent(event);
    }

    // -- data processing methods ---------------------------------------------

    doDeleteLink() {
        this.selected.loading++;
        this.service.deleteById(this.selected.id, false)
            .then(() => {
                const confirmation: string = this.translate.instant('Link has been deleted successfully');
                this.messages.writeSuccess(confirmation);

                this.reload(this.selected);
            }).catch(() => {})
            .then(() => this.selected.loading--);
    }

    sort() {
        this.locker.lock();
        this.service.getItems(this.partners, null, this.tableSortOrder)
            .then(response => {
                this.partners = response;
            }).catch(() => {})
            .then(() => this.locker.unlock());
    }
}
