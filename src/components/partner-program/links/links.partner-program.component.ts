import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FadeAnimation} from '../../../shared/fade-animation';
import {PartnerProgramService} from '../../../services/partner-program.service';
import {PartnerProgramItem, PartnerProgramModel} from "../../../models/partner-program.model";

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

    table = {
        title: {
            titles: [
                'Name',
                'Link',
                'Status',
                'Visited',
                'Registered',
                'Rewards Summary'
            ],
            keys: [
                'name',
                'refLink',
                'status',
                'visited',
                'registered',
                'totalBonus'
            ]
        }
    };

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

    constructor(private _service: PartnerProgramService) {
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
