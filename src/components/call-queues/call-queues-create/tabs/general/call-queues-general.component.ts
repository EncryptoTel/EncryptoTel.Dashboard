import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../../../services/call-queues.services';
import {Param} from '../../../../../models/queue.model';

@Component({
  selector: 'pbx-call-queues-general',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesGeneralComponent {
  constructor(private _services: CallQueuesServices) {
    this.getNumbers();
    this._services.userView.isCurCompMembersAdd = false;
  }

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

  private getNumbers(): void {
    this._services.getNumbers().then(res => {
      this.numbers = res;
    }).catch(err => {
      console.error(err);
    });
  }
}
