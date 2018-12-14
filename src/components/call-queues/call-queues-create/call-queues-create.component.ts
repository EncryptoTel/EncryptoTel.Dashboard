import {Component} from '@angular/core';
import {CallQueueService} from '../../../services/call-queue.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'pbx-call-queues-create',
    templateUrl: './template.html',
})

export class CallQueuesCreateComponent {

    headerText = 'Call Queue Members';
    generalHeaderText = 'Create New Queue';
    cmpType = 'callQueue';

    constructor(public service: CallQueueService, public translate: TranslateService) {
        this.headerText = this.translate.instant('Call Queue Members');
        this.generalHeaderText = this.translate.instant('Create New Queue');
    }

}
