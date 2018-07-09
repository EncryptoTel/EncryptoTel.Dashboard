import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FadeAnimation} from "../../../shared/fade-animation";
import {PartnerProgramService} from "../../../services/partner-program.service";

@Component({
    selector: 'links-partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [PartnerProgramService]
})

export class LinksPartnerProgramComponent implements OnInit {
    @Input() items: any;

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
    selected;

    constructor(private service: PartnerProgramService) {

    }

    reload() {
        this.onReload.emit({loading: false});
    }

    select() {

    }

    edit(item) {
        this.selected = item;
        this.selected.loading = true;
        this.modalCreate.visible = true;
    }

    doCancelEdit() {
        this.selected.loading = false;
    }

    delete(item) {
        this.selected = item;
        this.modalDelete.title = item.name;
        this.modalDelete.visible = true;
    }

    doCreateLink() {
        this.loading++;
        if (!this.selected.id) {
            this.items.push({loading: true});
        }
        this.service.save(this.selected.id, this.selected.name).then(res => {
            this.reload();
            this.loading--;
        }).catch(res => {
            this.loading--;
        });
    }

    doDeleteLink() {
        this.loading++;
        this.selected.loading = true;
        this.service.deleteById(this.selected.id).then(res => {
            this.loading--;
            if (!this.loading) this.reload();
        }).catch(res => {
            this.loading--;
        });
    }

    clickCreateLink() {
        this.selected = {id: 0, name: ''};
        this.modalCreate.visible = true;
    }

    ngOnInit(): void {

    }

}
