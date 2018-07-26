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

    modalCreate = {
        visible: false,
        title: 'Generate Link',
        body: null,
        buttons: [
            {type: 'cancel', value: 'Cancel'},
            {type: 'success', value: 'Create'},
        ]
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

    constructor(private service: PartnerProgramService) {

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

    select() {

    }

    edit(item: PartnerProgramItem) {
        this.selected = item;
        this.selected.loading++;
        this.modalCreate.buttons[1].value = 'Edit';
        this.modalCreate.visible = true;
    }

    doCancelEdit() {
        this.selected.loading--;
    }

    delete(item: PartnerProgramItem) {
        this.selected = item;
        this.modalDelete.title = item.name;
        this.modalDelete.visible = true;
    }

    doCreateLink() {
        let item = this.selected;
        if (!this.selected.id) {
            item = new PartnerProgramItem();
            this.partners.items.push(item);
        }
        item.loading++;
        this.service.save(this.selected.id, this.selected.name).then(res => {
            this.reload(item);
            item.loading--;
        }).catch(() => {
            item.loading--;
        });
    }

    doDeleteLink() {
        this.selected.loading++;
        this.service.deleteById(this.selected.id).then(res => {
            this.reload(this.selected);
            this.selected.loading--;
        }).catch(() => {
            this.selected.loading--;
        });
    }

    clickCreateLink() {
        this.modalCreate.buttons[1].value = 'Create';
        this.selected = new PartnerProgramItem();
        this.modalCreate.visible = true;
    }

    ngOnInit(): void {

    }

}
