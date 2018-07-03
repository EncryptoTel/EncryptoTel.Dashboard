import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

// todo switch to ring-groups model and service
import {CallRules} from '../../models/call-rules.model';
import {CallRulesServices} from '../../services/call-rules.services';

@Component({
  selector: 'ring-groups-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class RingGroupsComponent implements OnInit {

  callRules: CallRules[];
  tableInfo = {
    titles: ['Ring Groups Name', 'Phone Number', 'Ring Strategy', 'Ring Time', 'No-answer Destination', 'Description'],
    keys: ['name', 'phoneNumber', 'strategy', 'time', 'naDestination', 'Description']
  };
  loading = true;

  constructor(private service: CallRulesServices,
              private router: Router) {
  }

  createRingGroup(): void {
    this.router.navigate(['cabinet', 'ring-groups', 'create']);
  }

  editCallRules(callRule: CallRules): void {
    this.router.navigate(['cabinet', 'ring-groups', `${callRule.id}`]);
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
