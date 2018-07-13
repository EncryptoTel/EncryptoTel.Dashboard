import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {FadeAnimation} from '../../shared/fade-animation';
import {CallRulesService} from '../../services/call-rules.service';
import {CallRules, CallRulesItem, CallRulesModel} from '../../models/call-rules.model';


@Component({
    selector: 'pbx-call-rules',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallRulesComponent implements OnInit {
    table = {
        titles: ['Phone number', 'Call Rule Name', 'Status', 'Description'],
        keys: ['phoneNumber', 'name', 'statusName', 'description']
    };
    loading: number = 0;

    modal = {
        visible: false,
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };
    pageInfo: CallRulesModel = new CallRulesModel();

    constructor(private service: CallRulesService,
                private router: Router) {
    }

    create() {
        this.router.navigate(['cabinet', 'call-rules', 'create']);
    }

    edit(item: CallRulesItem) {
        this.router.navigate(['cabinet', 'call-rules', `${item.id}`]);
    }

    delete(item: CallRulesItem) {
        item.loading++;
        this.service.deleteById(item.id).then(() => {
            this.getItems(item);
            item.loading--;
        }).catch(err => {
            item.loading--;
        });
    }

    getItems(item = null) {
        item ? item.loading++ : this.loading++;
        this.service.getCallRules(this.pageInfo).then(res => {
            this.pageInfo = res;
            item ? item.loading-- : this.loading--;
        }).catch(err => {
            item ? item.loading-- : this.loading--;
        });
    }

    ngOnInit() {
        this.getItems();
    }

}
