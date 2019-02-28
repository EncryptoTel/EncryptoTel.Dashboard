import {Component, OnInit} from '@angular/core';

import {FadeAnimation} from '@shared/fade-animation';
import {IvrService} from '@services/ivr.service';
import {PageInfoModel, TableInfoExModel, TableInfoItem} from '@models/base.model';
import {TranslateService} from '@ngx-translate/core';
import { MessageServices } from '@services/message.services';


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
        titles: ['Name', 'Phone Number', 'Status', 'Description'],
        keys: ['name', 'sip.phoneNumber', 'statusName', 'description']
    };
    tableModel: TableInfoExModel = new TableInfoExModel();

    constructor(private service: IvrService,
                public translate: TranslateService,
                public message: MessageServices) {
        this.tableModel.sort.isDown = false;
        this.tableModel.sort.column = 'name';
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Name'), 'name', 'name'));
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Phone Number'), 'sip.phoneNumber', 'sip.phoneNumber'));
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Status'), 'statusName', 'statusName'));
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Description'), 'description', 'description'));
    }

    ngOnInit(): void {
        this.model.page = 1;
        this.model.limit = 10;
        this.getItems();
    }

    getItems() {
        this.loading ++;
        this.service.getItems(this.model)
            .then(response => {
                // console.log('ivr-list', response);
            })
            .catch(() => {})
            .then(() => this.loading --);
    }

    onDelete(): void {
        const delMessage: string = this.translate.instant('IVR has been deleted successfully');
        this.message.writeSuccess(delMessage);
    }
}
