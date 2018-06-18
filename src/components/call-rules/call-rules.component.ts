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

  constructor(private service: CallRulesServices,
              private router: Router) {
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

  private getCallRules(): void {
    this.service.getCallRules().then(res => {
      this.callRules = res.items;
      this.callRules.forEach(callRule => {
        callRule.status === 0 ? callRule.statusParameter = 'disabled' : callRule.statusParameter = 'enabled';
      });
      this.loading = false;
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit() {
    this.getCallRules();
  }
}
