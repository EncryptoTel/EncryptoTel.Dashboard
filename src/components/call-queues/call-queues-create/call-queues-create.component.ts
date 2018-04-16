import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {CallQueuesServices} from '../../../services/call-queues.services';


@Component({
  selector: 'pbx-call-queues-create',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesCreateComponent {
  constructor(private _service: CallQueuesServices,
              private activatedRoute: ActivatedRoute) {
    if (this.activatedRoute.snapshot.params.id) {
      this._service.callQueue.sipId = this.activatedRoute.snapshot.params.id;
    } else {
      console.log('edit mode');
    }

  }

  save(): void {
    this._service.save();
  }

  cancel(): void {
    this._service.cancel();
  }
}
