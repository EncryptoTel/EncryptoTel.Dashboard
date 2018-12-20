import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {FadeAnimation} from '@shared/fade-animation';
import {CallQueueService} from '@services/call-queue.service';
import {CallQueueModel} from '@models/call-queue.model';
import {ListComponent} from '@elements/pbx-list/pbx-list.component';


@Component({
    selector: 'pbx-call-queues',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class CallQueuesComponent implements OnInit {

    table: any;
    pageInfo: CallQueueModel = new CallQueueModel();

    @ViewChild(ListComponent) list: ListComponent;

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

    ngOnInit(): void {
        this.getParams();
    }

    getParams() {
        this.service.getParams().then(() => {})
            .catch(() => {})
            .then(() => {});
    }

    load($event) {
        this.list.pageInfo.items.forEach(item => {
            item.strategyName = this.translate.instant(item.strategyName);
        });
    }
}
