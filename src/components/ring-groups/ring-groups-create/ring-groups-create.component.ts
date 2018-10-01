import {Component} from '@angular/core';
import {RingGroupService} from '../../../services/ring-group.service';


@Component({
    selector: 'ring-groups-create-component',
    templateUrl: './template.html',
})
export class RingGroupsCreateComponent {
    headerText: string = 'Ring Group Members';
    generalHeaderText: string = 'Create Ring Group';
    cmpType: string = 'ringGroup';

    constructor(public service: RingGroupService) {}
}
