import {Component} from '@angular/core';
import {RingGroupService} from '../../../services/ring-group.service';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'ring-groups-create-component',
    templateUrl: './template.html',
})
export class RingGroupsCreateComponent {
    headerText: string = 'Ring Group Members';
    generalHeaderText: string = 'Create Ring Group';
    cmpType: string = 'ringGroup';

    constructor(public service: RingGroupService,
                public translate: TranslateService) {
        this.headerText = this.translate.instant('Ring Group Members');
        this.generalHeaderText = this.translate.instant('Create Ring Group');
    }
}
