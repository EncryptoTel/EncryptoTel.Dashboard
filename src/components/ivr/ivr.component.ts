import {Component, OnInit} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';
import {IvrService} from '../../services/ivr.service';
import {PageInfoModel} from '../../models/base.model';


@Component({
    selector: 'pbx-ivr',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class IvrComponent implements OnInit {

    loading: number = 0;
    model: PageInfoModel = new PageInfoModel();

    table = {
        titles: ['Name', 'Status', 'Description'],
        keys: ['name', 'statusName', 'description']
    };

    constructor(private service: IvrService) {
    }

    ngOnInit(): void {
        this.model.page = 1;
        this.model.limit = 1000;
        this.getItems();
    }

    getItems() {
        this.loading++;
        this.service.getItems(this.model).then(response => {
            console.log('ivr', response);
        }).catch(() => {
        })
            .then(() => this.loading--);
    }
}
