import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {CallRulesService} from '../../services/call-rules.service';
import {CallRulesModel} from '../../models/call-rules.model';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-call-rules',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallRulesComponent {

    table: any;
    pageInfo: CallRulesModel = new CallRulesModel();

    constructor(public service: CallRulesService, public translate: TranslateService) {
        this.table = {
            titles: [this.translate.instant('Phone number'), this.translate.instant('Call Rule Name'), this.translate.instant('Status'), this.translate.instant('Description')],
            keys: ['phoneNumber', 'name', 'statusName', 'description']
        };
    }


}
