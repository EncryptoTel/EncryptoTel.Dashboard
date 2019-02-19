import {OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {AnimationComponent, formatDateTime, getMomentFormatDete} from '@shared/shared.functions';
import {BaseComponent} from '@elements/pbx-component/pbx-component.component';
import {SessionsModel} from '@models/settings.models';
import {ButtonItem, TableInfoExModel, TableInfoItem} from '@models/base.model';
import {SessionsService} from '@services/sessions.service';
import {ListComponent} from '@elements/pbx-list/pbx-list.component';
import {LocalStorageServices} from '@services/local-storage.services';


@AnimationComponent({
    selector: 'profile-component',
    templateUrl: './template.html',
    styleUrls: ['../local.sass'],
    providers: [SessionsService]
})

export class SessionsComponent extends BaseComponent implements OnInit {

    sessions: SessionsModel = new SessionsModel();
    table: TableInfoExModel = new TableInfoExModel();
    buttons: ButtonItem[] = [];
    dateFormat: any;

    @ViewChild(ListComponent) list;

    constructor(
        public service: SessionsService,
        private router: Router,
        public translate: TranslateService,
        private storage: LocalStorageServices
    ) {
        super();
        this.dateFormat = getMomentFormatDete(this.storage.readItem('dateTimeFormat'), this.storage.readItem('TimeFormat'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Active Session'), 'session'));
        this.table.items.push(new TableInfoItem(this.translate.instant('IP'), 'ip'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Country'), 'country'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Date start'), 'displayCreated'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Date end'), 'displayExpires'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Status'), 'status', null, 80));
        // this.table.items.push(new TableInfoItem('User Agent', 'userAgent'));

        this.buttons.push(new ButtonItem(0, 'Back', 'cancel', true));
    }

    ngOnInit() {}

    back() {
        this.router.navigate(['cabinet', 'settings']);
    }

    load(): void {
        this.list.pageInfo.items.forEach(item => {
            item.created = formatDateTime(item.created, this.dateFormat);
            item.expires = formatDateTime(item.expires, this.dateFormat);
        });


    }
}
