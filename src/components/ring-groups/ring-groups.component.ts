import {Component, ViewChild} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {RingGroupService} from '../../services/ring-group.service';
import {RingGroupModel} from '../../models/ring-group.model';
import {TranslateService} from '@ngx-translate/core';
import {ListComponent} from '@elements/pbx-list/pbx-list.component';

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
    @ViewChild(ListComponent) list: ListComponent;

    constructor(private service: RingGroupService, public translate: TranslateService) {
        this.table = {
            titles: [
                this.translate.instant('Ring Group Name'),
                this.translate.instant('Phone Number'),
                this.translate.instant('Ring Strategy'),
                this.translate.instant('Ring Time'),
                this.translate.instant('Description')
            ],
            keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout', 'description']
        };
    }

    load($event) {
        this.list.pageInfo.items.forEach(item => {
            item.strategyName = this.translate.instant(item.strategyName);
        });
    }

}
