import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {RingGroupService} from '../../services/ring-group.service';
import {RingGroupModel} from '../../models/ring-group.model';

@Component({
    selector: 'ring-groups-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsComponent {

    table = {
        titles: ['Ring Group Name', 'Phone Number', 'Ring Strategy', 'Ring Time', 'Description'],
        keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout', 'description']
    };
    pageInfo: RingGroupModel = new RingGroupModel();

    constructor(private service: RingGroupService) {
    }

}
