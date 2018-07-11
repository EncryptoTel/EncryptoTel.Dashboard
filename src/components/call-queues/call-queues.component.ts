///<reference path="../../../node_modules/class-transformer/index.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FadeAnimation} from '../../shared/fade-animation';
import {CallQueueService} from '../../services/call-queue.service';
import {CallQueueItem, CallQueueModel} from '../../models/call-queue.model';
import {RingGroupItem} from "../../models/ring-group.model";
import {plainToClass} from "class-transformer";

@Component({
    selector: 'pbx-call-queues',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesComponent implements OnInit {

    pageInfo: CallQueueModel = new CallQueueModel();

    loading: number = 0;

    table = {
        titles: ['Queue Name', 'Phone Number', 'Ring Strategy', 'Ring Time', 'Description'],
        keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout', 'description']
    };

    constructor(private service: CallQueueService,
                private router: Router) {
    }

    keys = ['name', 'phone', 'strategy', 'timeout', 'description'];


    edit(item: CallQueueItem): void {
        this.router.navigate(['cabinet', 'call-queues', `${item.id}`]);
    }

    delete(item: CallQueueItem): void {
        this.service.beginLoading(item);
        this.service.deleteById(item.id).then(() => {
            this.getItems(item);
            this.service.endLoading(item);
        }).catch(err => {
            this.service.endLoading(item);
        });
    }

    getItems(item = null): void {
        this.service.beginLoading(item ? item : this);
        this.service.getItems(this.pageInfo).then((res: CallQueueModel) => {
            this.pageInfo = plainToClass(CallQueueModel, res);
            this.service.endLoading(item ? item : this);
        }).catch(err => {
            this.service.endLoading(item ? item : this);
        });
    }

    ngOnInit() {
        this.getItems();
    }

}
