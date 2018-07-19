import {Component} from '@angular/core';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {RingGroupService} from '../../../../services/ring-group.service';
import {RefsServices} from '../../../../services/refs.services';

@Component({
    selector: 'ring-groups-general',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsGeneralComponent {

    loading = 0;
    numbers = [];

    constructor(public service: RingGroupService,
                private refs: RefsServices) {
        this.getNumbers();
        // this.service.userView.isCurCompMembersAdd = false;
    }

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
