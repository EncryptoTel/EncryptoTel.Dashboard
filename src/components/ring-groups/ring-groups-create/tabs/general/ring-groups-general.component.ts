import {Component, OnInit} from '@angular/core';
import {Param} from '../../../../../models/queue.model';
import {FadeAnimation} from '../../../../../shared/fade-animation';
import {RingGroupsServices} from '../../../../../services/ring-groups.service';
import {RefsServices} from '../../../../../services/refs.services';

@Component({
  selector: 'ring-groups-general',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class RingGroupsGeneralComponent {

  constructor(
    private _services: RingGroupsServices,
    private refs: RefsServices
  ) {
    this.getNumbers();
    this._services.userView.isCurCompMembersAdd = false;
  }

  loading = true;
  numbers = [];

  // ngOnInit() {
  //   console.log(this.numbers);
  // }

  setNumber(number): void {
    console.log(number);
    this._services.ringGroups.sipId = number.id;
    this._services.userView.phoneNumber = number.phoneNumber;
  }

  setStrategies(strategy: Param): void {
    this._services.ringGroups.strategy = strategy.id;
    this._services.userView.strategy.code = strategy.code;
  }

  setNoanswer(): void {
    // this._services.ringGroups.strategy = strategy.id;
    // this._services.userView.strategy.code = strategy.code;
  }

  private getNumbers(): void {
    this.refs.getSipOuters().then(res => {
      this.numbers = res;
      console.log(this.numbers);
      this.loading = false;
    }).catch(err => {
      console.error(err);
    });
  }
}
