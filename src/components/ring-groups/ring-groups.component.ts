import { Component, ViewChild } from '@angular/core';
import { FadeAnimation } from '../../shared/fade-animation';
import { RingGroupService } from '../../services/ring-group.service';
import { RingGroupModel } from '../../models/ring-group.model';
import { TranslateService } from '@ngx-translate/core';
import { ListComponent } from '@elements/pbx-list/pbx-list.component';
import { TableInfoExModel, TableInfoItem } from '@models/base.model';
import { MessageServices } from '@services/message.services';
import { reDelSuccess, reDelInUse } from '@shared/vars';

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

  onDelete(event: any): void {
    if (!this.checkDeletionError(event.response)) {
      this.messages.writeSuccess(this.translate
        .instant('Ring Group has been deleted successfully'));
    } else {
        const error: string = this.getDeletionError(event.response);
        this.messages.writeError(error);
    }
  }

  checkDeletionError(response: any): boolean {
    return (response && response.message && !reDelSuccess.test(response.message));
  }

  getDeletionError(response: any): string {
    if (reDelInUse.test(response.message)) {
      const match = reDelInUse.exec(response.message);
      const module = this.translate.instant(match[1]);
      const message = this.translate
        .instant('ringGroupInUse', { module: module, name: match[2] });
      return message;
    }
    return this.translate.instant(response.message);
  }
}
