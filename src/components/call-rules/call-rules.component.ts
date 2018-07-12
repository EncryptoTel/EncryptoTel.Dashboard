import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {FadeAnimation} from '../../shared/fade-animation';
import {CallRulesServices} from '../../services/call-rules.services';
import {CallRules} from '../../models/call-rules.model';


@Component({
  selector: 'pbx-call-rules',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class CallRulesComponent implements OnInit {
  callRules: CallRules[];
  tableInfo = {
    titles: ['Phone number', 'Call Rule Name', 'Status', 'Description'],
    keys: ['sip.phoneNumber', 'name', 'statusParameter', 'description']
  };
  loading = true;

  keys = ['phone', 'name', 'status', 'description'];
  data = [];
  modal = {
    visible: false,
    confirm: {type: 'error', value: 'Delete'},
    decline: {type: 'cancel', value: 'Cancel'}
  };
  del;
  pageInfo = {
    page: 1,
    total: null
  };

  constructor(private service: CallRulesServices,
              private router: Router) {
  }

  clickDeleteIcon(id) {
    this.del = this.findById(this.callRules, id);
    this.modal.visible = true;
  }

  createCallRule(): void {
    this.router.navigate(['cabinet', 'call-rules', 'create']);
  }

  editCallRules(callRule: CallRules): void {
    this.router.navigate(['cabinet', 'call-rules', `${callRule.id}`]);
  }

  deleteCallRule(callRule: CallRules): void {
    this.service.deleteCallRules(callRule.id).then(() => {
      this.getCallRules();
    }).catch(err => {
      console.error(err);
    });
  }

  changePage(page: number) {
    this.pageInfo.page = page;
    this.getCallRules();
  }

  setTableData(): void {
    this.data = [];
    this.callRules.forEach(callRule => {
      this.data.push({
        id: callRule.id,
        phone: callRule.sip ? callRule.sip['phoneNumber'] : null,
        name: callRule.name,
        status: callRule.statusParameter,
        description: callRule.description
      });
    });
  }

  private getCallRules(): void {
    this.service.getCallRules(this.pageInfo.page).then(res => {
      this.pageInfo.total = res.pageCount;
      this.callRules = res.items;
      this.callRules.forEach(callRule => {
        callRule.statusParameter = callRule.status === 0 ? 'disabled' : 'enabled';
      });
      this.setTableData();
      this.loading = false;
    }).catch(err => {
    });
  }

  ngOnInit() {
    this.getCallRules();
  }

  findById(array: any[], id: number): object {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id == id) {return array[i]; }}
    return null;
  }

}
