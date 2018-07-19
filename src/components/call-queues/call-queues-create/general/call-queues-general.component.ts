import {Component} from '@angular/core';
import {CallQueueService} from '../../../../services/call-queue.service';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {RefsServices} from '../../../../services/refs.services';

@Component({
    selector: 'pbx-call-queues-general',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesGeneralComponent {

    constructor(public service: CallQueueService,
                private refs: RefsServices) {
        this.getNumbers();
        // this.service.userView.isCurCompMembersAdd = false;
    }

    loading = 0;
    numbers = [];


    private getNumbers(): void {
        this.loading++;
        this.refs.getSipOuters().then(res => {
            this.numbers = res;
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }
}
