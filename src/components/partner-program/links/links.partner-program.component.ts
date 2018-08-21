import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FadeAnimation} from '../../../shared/fade-animation';
import {PartnerProgramService} from '../../../services/partner-program.service';
import {PartnerProgramItem, PartnerProgramModel} from "../../../models/partner-program.model";
import {TableInfoExModel, TableInfoItem} from '../../../models/base.model';

@Component({
    selector: 'links-partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [PartnerProgramService]
})

export class LinksPartnerProgramComponent implements OnInit {
    @Input() partners: PartnerProgramModel;

    @Output() onReload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelect: EventEmitter<PartnerProgramItem> = new EventEmitter();
    @Output() onEdit: EventEmitter<PartnerProgramItem> = new EventEmitter();
    @Output() onCopyToClipboard: EventEmitter<PartnerProgramItem> = new EventEmitter();

    public table: TableInfoExModel = new TableInfoExModel();

    modalDelete = {
        visible: false,
        title: '',
        body: 'Are you sure?',
        buttons: [
            {type: 'cancel', value: 'Cancel'},
            {type: 'error', value: 'Delete'},
        ]
    };
    loading = 0;
    selected: PartnerProgramItem;
    tableReload = 0;

    constructor(private _service: PartnerProgramService) {
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

    reload(item) {
        this.onReload.emit(item);
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
        this.modalDelete.visible = true;
    }

    doDeleteLink() {
        this.selected.loading++;
        this._service.deleteById(this.selected.id).then(res => {
            this.reload(this.selected);
            this.selected.loading--;
        }).catch(() => {
            this.selected.loading--;
        });
    }

    clickCreateLink() {
        let item = new PartnerProgramItem();
        this.onEdit.emit(item);
    }

    sort() {
        this.tableReload++;
        this._service.getItems(this.partners, null, this.table ? this.table.sort : null).then(res => {
            this.partners = res;
            this.tableReload--;
        }).catch(() => {
            this.tableReload--;
        });
    }

    copyToClipboard(item: PartnerProgramItem, event: MouseEvent): void {
        this.onCopyToClipboard.emit(item);
        this.killEvent(event);
    }

    killEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    ngOnInit(): void {
    }
}
