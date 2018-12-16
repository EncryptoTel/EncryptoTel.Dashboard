import {Component, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/Observable';

import {CallQueueService} from '@services/call-queue.service';
import {CanFormComponentDeactivate} from '@services/can-deactivate-form-guard.service';
import {QueueCreateComponent} from '@elements/pbx-queue-create/pbx-queue-create.component';


@Component({
    selector: 'pbx-call-queues-create',
    templateUrl: './template.html',
})
export class CallQueuesCreateComponent implements CanFormComponentDeactivate {
    @ViewChild('queueCreate') queueCreate: QueueCreateComponent;

    headerText = 'Call Queue Members';
    generalHeaderText = 'Create New Queue';
    cmpType = 'callQueue';

    constructor(
        public service: CallQueueService,
        public translate: TranslateService
    ) {
        this.headerText = this.translate.instant('Call Queue Members');
        this.generalHeaderText = this.translate.instant('Create New Queue');
    }
    
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.queueCreate.canDeactivate();
    }
}
