import {OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {AnimationComponent} from '@shared/shared.functions';
import {BaseComponent} from '@elements/pbx-component/pbx-component.component';
import {SessionsModel} from '@models/settings.models';
import {ButtonItem, TableInfoExModel, TableInfoItem} from '@models/base.model';
import {SessionsService} from '@services/sessions.service';


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

    constructor(
        public service: SessionsService,
        private router: Router,
        public translate: TranslateService
    ) {
        super();

        this.table.items.push(new TableInfoItem(this.translate.instant('Active Session'), 'session'));
        this.table.items.push(new TableInfoItem(this.translate.instant('IP'), 'ip'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Country'), 'country'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Date'), 'displayExpires'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Status'), 'status', null, 80));
        // this.table.items.push(new TableInfoItem('User Agent', 'userAgent'));
        
        this.buttons.push(new ButtonItem(0, 'Back', 'cancel', true));
    }

    ngOnInit() {}

    back() {
        this.router.navigate(['cabinet', 'settings']);
    }
}
