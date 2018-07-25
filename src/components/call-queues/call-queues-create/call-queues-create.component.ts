import {Component} from '@angular/core';
import {CallQueueService} from "../../../services/call-queue.service";

@Component({
    selector: 'pbx-call-queues-create',
    templateUrl: './template.html',
})

export class CallQueuesCreateComponent {

    constructor(public service: CallQueueService) {

    }

}
