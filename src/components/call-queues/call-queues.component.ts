import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {CallQueueService} from '../../services/call-queue.service';
import {CallQueueModel} from '../../models/call-queue.model';

@Component({
    selector: 'pbx-call-queues',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesComponent {

    table = {
        titles: ['Queue Name', 'Phone Number', 'Ring Strategy', 'Ring Time', 'Description'],
        keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout', 'description']
    };
    pageInfo: CallQueueModel = new CallQueueModel();

    constructor(private service: CallQueueService) {}
}
