import { Component, ViewChild, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FadeAnimation } from '@shared/fade-animation';
import { CallRulesService } from '@services/call-rules.service';
import { CallRulesItem, CallRulesModel } from '@models/call-rules.model';
import { TableInfoExModel, TableInfoItem } from '@models/base.model';
import { ListComponent } from '@elements/pbx-list/pbx-list.component';
import { MessageServices } from '@services/message.services';
import { ModalEx } from '@elements/pbx-modal/pbx-modal.component';


@Component({
  selector: 'pbx-call-rules',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})
export class CallRulesComponent implements OnInit {

  table: TableInfoExModel = new TableInfoExModel();
  pageInfo: CallRulesModel = new CallRulesModel();

  sidebar: CallRulesItem = null;
  selected: CallRulesItem;
  actionsList: any;

  modalExit: ModalEx = new ModalEx('', 'cancelEdit');

  @ViewChild(ListComponent) list: ListComponent;

  constructor(
    public service: CallRulesService,
    public translate: TranslateService,
    public message: MessageServices
  ) {

    this.table.sort.isDown = true;
    this.table.sort.column = 'phoneNumber';
    this.table.items.push(new TableInfoItem(this.translate.instant('Phone number'), 'phoneNumber', 'phoneNumber'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Call Rule Name'), 'name', 'name'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Status'), 'statusName', 'statusName'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Description'), 'description', 'description'));
  }

  onDelete(): void {
    const delMessage: string = this.translate.instant('Call Rule has been deleted successfully');
    this.message.writeSuccess(delMessage);
  }

  select(item) {
    console.log(item);
    this.selected = item;
    this.sidebar = this.sidebar ? (this.sidebar.id === item.id ? null : item) : item;
  }

  toggleEnable(): void {
    this.selected.enabled = !this.selected.enabled;
    if (this.selected.enabled) {
      this.service
        .checkCallRuleEnableAvailable(this.selected.phoneNumber)
        .then(result => {
          if (result && result.itemsCount > 0) {
            this.showWarningModal(
              this.translate.instant('callRuleInUse', { name: result.items[0].name }),
              () => { },
              () => {
                this.selected.enabled = false;
              }
            );
          }
        });
    }
  }

  private getParams(): void {
    this.service.getParams().then(response => {
      this.actionsList = [];
      response.actions.forEach(item => {
        this.actionsList[item.id] = this.translate.instant(item.code);
      });
    })
      .catch(() => { })
      .then(() => { });
  }

  getActionName(action) {
    return this.actionsList[action];
  }

  getActionParamsName(action) {
    let result: any;
    switch (action) {
      case 1:
        result = this.translate.instant('Extension number');
        break;
      case 2:
        result = this.translate.instant('Extension number');
        break;
      case 3:
        result = this.translate.instant('Queue');
        break;
      case 4:
        result = '';
        break;
      case 5:
        result = this.translate.instant('Voice greeting');
        break;
      case 6:
        result = this.translate.instant('Group');
        break;
    }
    return result;
  }

  getActionParamsValue(item) {
    let result: any;
    switch (item.action) {
      case 1:
        result = item.sipInner.phoneNumber;
        break;
      case 2:
        result = this.translate.instant('Extension number');
        break;
      case 3:
        result = item.callQueue.name;
        break;
      case 4:
        result = '';
        break;
      case 5:
        result = item.accountFile.fileName;
        break;
      case 6:
        result = item.ringGroup.name;
        break;
    }
    return result;
  }

  ngOnInit() {
    this.getParams();
  }

  edit() {
  }

  cancel() {
    this.sidebar = null;
    this.selected = null;
  }

  showWarningModal(message: string, confirmCallback?: () => void, cancelCallback?: () => void): void {
    this.modalExit.setMessage(message);
    this.modalExit.confirmCallback = confirmCallback;
    this.modalExit.cancelCallback = cancelCallback;
    this.modalExit.show();
  }
}
