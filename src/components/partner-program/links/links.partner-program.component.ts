import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FadeAnimation} from '../../../shared/fade-animation';
import {PartnerProgramService} from '../../../services/partner-program.service';
import {PartnerProgramItem, PartnerProgramModel} from '../../../models/partner-program.model';
import {TableInfoExModel, TableInfoItem} from '../../../models/base.model';
import {killEvent} from '../../../shared/shared.functions';
import {ModalEx} from '../../../elements/pbx-modal/pbx-modal.component';
import {Lockable, Locker} from '../../../models/locker.model';


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

    constructor(private _service: PartnerProgramService) {
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

        this.modalDelete = new ModalEx('Are you sure?', 'delete');
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
        let item = new PartnerProgramItem();
        this.onEdit.emit(item);
    }

    copyToClipboard(item: PartnerProgramItem, event: MouseEvent): void {
        this.onCopyToClipboard.emit(item);
        killEvent(event);
    }

    // -- data processing methods ---------------------------------------------

    doDeleteLink() {
        this.selected.loading++;
        this._service.deleteById(this.selected.id).then(() => {
            this.reload(this.selected);
        }).catch(() => {
        })
            .then(() => this.selected.loading--);
    }

    sort() {
        this.locker.lock();
        this._service.getItems(this.partners, null, this.tableSortOrder).then(response => {
            this.partners = response;
        }).catch(() => {
        })
            .then(() => this.locker.unlock());
    }
}
