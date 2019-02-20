import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FadeAnimation } from '@shared/fade-animation';
import { CallQueueService } from '@services/call-queue.service';
import { CallQueueModel } from '@models/call-queue.model';
import { ListComponent } from '@elements/pbx-list/pbx-list.component';
import { TableInfoExModel, TableInfoItem } from '@models/base.model';
import { MessageServices } from '@services/message.services';


@Component({
  selector: 'pbx-call-queues',
  templateUrl: './template.html',
  styleUrls: [ './local.sass' ],
  animations: [ FadeAnimation('300ms') ]
})
export class CallQueuesComponent implements OnInit {

  table: TableInfoExModel = new TableInfoExModel();
  pageInfo: CallQueueModel = new CallQueueModel();

  @ViewChild(ListComponent) list: ListComponent;

  constructor(
    private service: CallQueueService,
    private translate: TranslateService,
    private message: MessageServices
  ) {
    this.table.sort.isDown = true;
    this.table.sort.column = 'name';
    this.table.items.push(new TableInfoItem(this.translate.instant('Queue Name'), 'name', 'name'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Phone Number'), 'sip.phoneNumber', 'sip.phoneNumber'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Ring Strategy'), 'strategyName', 'strategyName'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Ring Time'), 'timeout', 'timeout'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Description'), 'description', 'description'));
  }

  ngOnInit(): void {
    this.getParams();
  }

  getParams() {
    this.service.getParams()
      .then(() => {})
      .catch(() => {})
      .then(() => {});
  }

  load(event): void {
    this.list.pageInfo.items.forEach(item => {
      item.strategyName = this.translate.instant(item.strategyName);
    });
  }

  onDelete(item: any): void {
    this.message.writeSuccess(this.translate.instant('Call Queue has been deleted successfully'));
  }
}
