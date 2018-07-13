import {Component, OnInit} from '@angular/core';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {RingGroupService} from '../../../../services/ring-group.service';
import {RefsServices} from '../../../../services/refs.services';
import {BaseParam} from "../../../../models/base.model";

@Component({
    selector: 'ring-groups-general',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsGeneralComponent implements OnInit {

    loading: number = 0;
    numbers = [];

    constructor(private service: RingGroupService,
                private refs: RefsServices) {
        this.service.userView.isCurCompMembersAdd = false;
    }

    private getNumbers(): void {
        this.loading++;
        this.refs.getSipOuters().then(res => {
            this.numbers = res;
            this.loading--;
        }).catch(err => {
            this.loading--;
        });
    }

    ngOnInit() {
        this.getNumbers();
    }

}
