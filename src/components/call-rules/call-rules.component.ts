import {Component, OnInit} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';
import {CallRulesServices} from '../../services/call-rules.services';
import {CallRules} from '../../models/call-rules.model';
import {Router} from '@angular/router';

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
    keys: ['sip.phoneNumber', 'name', 'status', 'description']
  };

  constructor(private service: CallRulesServices,
              private router: Router) {
  }

  createCallRule(): void {
    this.router.navigate(['cabinet', 'call-rules', 'create']);
  }

  private getCallRules(): void {
    this.service.getCallRules().then(res => {
      this.callRules = res.items;
      this.callRules.forEach(callRule => {
        
      });
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit() {
    this.getCallRules();
  }
}
