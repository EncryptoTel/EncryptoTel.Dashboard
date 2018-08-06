import {Component, Input} from '@angular/core';
import {FadeAnimation} from '../../../shared/fade-animation';
import {RefsServices} from '../../../services/refs.services';

@Component({
    selector: 'pbx-queue-general',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class QueueGeneralComponent {
    @Input() service;
    @Input() name;
    @Input() generalHeaderText;

    constructor(private refs: RefsServices) {
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
