import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {CallQueueService} from '../../services/call-queue.service';
import {CallQueueModel} from '../../models/call-queue.model';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'pbx-call-queues',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesComponent {

    table: any;
    pageInfo: CallQueueModel = new CallQueueModel();

    constructor(private service: CallQueueService,
                public translate: TranslateService) {

        this.table = {
            titles: [
                this.translate.instant('Queue Name'),
                this.translate.instant('Phone Number'),
                this.translate.instant('Ring Strategy'),
                this.translate.instant('Ring Time'),
                this.translate.instant('Description')
            ],
            keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout', 'description']
        };
    }
}
