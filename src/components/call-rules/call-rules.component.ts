import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {CallRulesService} from '../../services/call-rules.service';
import {CallRulesModel} from '../../models/call-rules.model';


@Component({
    selector: 'pbx-call-rules',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallRulesComponent {

    table = {
        titles: ['Phone number', 'Call Rule Name', 'Status', 'Description'],
        keys: ['phoneNumber', 'name', 'statusName', 'description']
    };
    pageInfo: CallRulesModel = new CallRulesModel();

    constructor(private service: CallRulesService) {

    }


}
