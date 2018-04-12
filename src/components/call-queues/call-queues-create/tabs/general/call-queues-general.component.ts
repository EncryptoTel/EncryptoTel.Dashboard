import {Component} from '@angular/core';
import {CallQueuesServices} from '../../../../../services/call-queues.services';

@Component({
  selector: 'pbx-call-queues-general',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesGeneralComponent {
  constructor(private _services: CallQueuesServices) {}

}
