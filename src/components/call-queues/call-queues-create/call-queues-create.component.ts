import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../services/call-queues.services';

@Component({
  selector: 'pbx-call-queues-create',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesCreateComponent {
  constructor(private _service: CallQueuesServices) {
  }

  save() {
    this._service.save();
  }

  cancel() {
    this._service.cancel();
  }
}
