import {Component, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/Observable';

import {RingGroupService} from '@services/ring-group.service';
import {CanFormComponentDeactivate} from '@services/can-deactivate-form-guard.service';
import {QueueCreateComponent} from '@elements/pbx-queue-create/pbx-queue-create.component';


@Component({
    selector: 'ring-groups-create-component',
    templateUrl: './template.html',
})
export class RingGroupsCreateComponent implements CanFormComponentDeactivate {
    @ViewChild('queueCreate') queueCreate: QueueCreateComponent;
    
    headerText: string = 'Ring Group Members';
    generalHeaderText: string = 'Create Ring Group';
    cmpType: string = 'ringGroup';

    constructor(
        public service: RingGroupService,
        public translate: TranslateService
    ) {
        this.headerText = this.translate.instant('Ring Group Members');
        this.generalHeaderText = this.translate.instant('Create Ring Group');
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.queueCreate.canDeactivate();
    }
}
