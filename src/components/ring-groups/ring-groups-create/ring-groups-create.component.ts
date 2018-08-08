import {Component} from '@angular/core';
import {RingGroupService} from '../../../services/ring-group.service';


@Component({
    selector: 'ring-groups-create-component',
    templateUrl: './template.html',
})

export class RingGroupsCreateComponent {

    headerText = 'Ring Group Members';
    generalHeaderText = 'Create Ring Group';
    cmpType = 'ringGroup';

    constructor(public service: RingGroupService) {

    }

}
