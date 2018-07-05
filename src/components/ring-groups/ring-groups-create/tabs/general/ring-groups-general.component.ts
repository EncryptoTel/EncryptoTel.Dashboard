import {Component} from '@angular/core';
import {CallQueueService} from '../../../../../services/call-queue.service';
import {Param} from '../../../../../models/queue.model';
import {FadeAnimation} from '../../../../../shared/fade-animation';

@Component({
  selector: 'ring-groups-general',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class RingGroupsGeneralComponent {
  constructor(private _services: CallQueueService) {
    // this.getNumbers();
    this._services.userView.isCurCompMembersAdd = false;
  }
  loading = true;
  numbers = {
    items: []
  };


  setNumber(number): void {
    this._services.callQueue.sipId = number.id;
    this._services.userView.phoneNumber = number.phoneNumber;
  }

  setStrategies(strategy: Param): void {
    this._services.callQueue.strategy = strategy.id;
    this._services.userView.strategy.code = strategy.code;
  }

  setAnnouncePosition(state: boolean): void {
    this._services.userView.announcePosition = state;
    this._services.callQueue.announceHoldtime = this._services.userView.announcePosition ? 1 : 0;
  }

  setAnnounceHoldtime(state: boolean): void {
    this._services.userView.announceHoldtime = state;
    this._services.callQueue.announceHoldtime = this._services.userView.announceHoldtime ? 1 : 0;
  }

  // private getNumbers(): void {
  //   this._services.getNumbers().then(res => {
  //     this.numbers = res;
  //     this.loading = false;
  //   }).catch(err => {
  //     console.error(err);
  //   });
  // }
}
