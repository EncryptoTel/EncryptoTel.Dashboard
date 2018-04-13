import {Component} from '@angular/core';
import {CallQueuesServices} from '../../services/call-queues.services';

@Component({
  selector: 'pbx-call-queues',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesComponent {
  constructor(private _service: CallQueuesServices) {
    this.getQueues();
  }

  private getQueues() {
    this._service.getQueues().then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }
}
