import { Component, ViewChild } from '@angular/core';
import { FadeAnimation } from '../../shared/fade-animation';
import { RingGroupService } from '../../services/ring-group.service';
import { RingGroupModel } from '../../models/ring-group.model';
import { TranslateService } from '@ngx-translate/core';
import { ListComponent } from '@elements/pbx-list/pbx-list.component';
import { TableInfoExModel, TableInfoItem } from '@models/base.model';
import { MessageServices } from '@services/message.services';

@Component({
  selector: 'ring-groups-component',
  templateUrl: './template.html',
  styleUrls: [ './local.sass' ],
  animations: [ FadeAnimation('300ms') ]
})
export class RingGroupsComponent {

  table: TableInfoExModel = new TableInfoExModel();
  pageInfo: RingGroupModel = new RingGroupModel();

  @ViewChild(ListComponent) list: ListComponent;

  constructor(
    public service: RingGroupService,
    public translate: TranslateService,
    public messages: MessageServices
  ) {
    this.table.sort.isDown = true;
    this.table.sort.column = 'name';
    this.table.items.push(
      new TableInfoItem(
        this.translate.instant('Ring Group Name'),
        'name',
        'name'
      )
    );
    this.table.items.push(
      new TableInfoItem(
        this.translate.instant('Phone Number'),
        'sip.phoneNumber',
        'sip.phoneNumber'
      )
    );
    this.table.items.push(
      new TableInfoItem(
        this.translate.instant('Ring Strategy'),
        'strategyName',
        'strategyName'
      )
    );
    this.table.items.push(
      new TableInfoItem(
        this.translate.instant('Ring Time'),
        'timeout',
        'timeout'
      )
    );
    this.table.items.push(
      new TableInfoItem(
        this.translate.instant('Description'),
        'description',
        'description'
      )
    );
  }

  load(): void {
    this.list.pageInfo.items.forEach(item => {
      item.strategyName = this.translate.instant(item.strategyName);
    });
  }

  onDelete(item: any): void {
    // this.messages.writeSuccess(this.translate.instant('Ring Group has been deleted successfully'));
  }
}
