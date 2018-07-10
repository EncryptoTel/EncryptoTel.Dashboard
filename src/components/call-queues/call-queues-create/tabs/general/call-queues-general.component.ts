import {Component} from '@angular/core';
import {CallQueueService} from '../../../../../services/call-queue.service';
import {FadeAnimation} from '../../../../../shared/fade-animation';
import {RefsServices} from '../../../../../services/refs.services';
import {BaseParam} from "../../../../../models/base.model";

@Component({
    selector: 'pbx-call-queues-general',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallQueuesGeneralComponent {
    constructor(private service: CallQueueService,
                private refs: RefsServices) {
        this.getNumbers();
        this.service.userView.isCurCompMembersAdd = false;
    }

    loading = true;
    numbers = [];


    setNumber(number): void {
        this.service.item.sipId = number.id;
        this.service.userView.phoneNumber = number.phoneNumber;
    }

    setStrategies(strategy: BaseParam): void {
        this.service.item.strategy = strategy.id;
        this.service.userView.strategy.code = strategy.code;
    }

    setAnnouncePosition(state: boolean): void {
        this.service.userView.announcePosition = state;
        this.service.item.announceHoldtime = this.service.userView.announcePosition ? 1 : 0;
    }

    setAnnounceHoldtime(state: boolean): void {
        this.service.userView.announceHoldtime = state;
        this.service.item.announceHoldtime = this.service.userView.announceHoldtime ? 1 : 0;
    }

    private getNumbers(): void {
        this.refs.getSipOuters().then(res => {
            // console.log(1);
            // console.log(res);
            this.numbers = res;
            this.loading = false;
        }).catch(err => {
            // console.error(err);
        });
    }
}
