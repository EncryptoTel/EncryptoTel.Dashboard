import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {CallRulesService} from '../../services/call-rules.service';
import {CallRulesModel} from '../../models/call-rules.model';
import {TranslateService} from '@ngx-translate/core';
import { TableInfoExModel, TableInfoItem } from '@models/base.model';


@Component({
    selector: 'pbx-call-rules',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallRulesComponent {

    table: TableInfoExModel = new TableInfoExModel();
    pageInfo: CallRulesModel = new CallRulesModel();

    constructor(public service: CallRulesService, public translate: TranslateService) {
        this.table.sort.isDown = true;
        this.table.sort.column = 'phoneNumber';
        this.table.items.push(new TableInfoItem(this.translate.instant('Phone number'), 'phoneNumber', 'phoneNumber'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Call Rule Name'), 'name', 'name'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Status'), 'statusName', 'statusName'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Description'), 'description', 'description'));
    }


}
