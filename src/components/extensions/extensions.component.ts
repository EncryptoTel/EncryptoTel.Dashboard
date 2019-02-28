import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MainViewComponent } from '@components/main-view.component';
import { MessageServices } from '@services/message.services';
import { ExtensionService } from '@services/extension.service';
import { ModalEx } from '@elements/pbx-modal/pbx-modal.component';
import { ListComponent } from '@elements/pbx-list/pbx-list.component';
import { ExtensionItem, ExtensionModel } from '@models/extension.model';
import { FilterItem, TableInfoExModel, TableInfoItem } from '@models/base.model';
import { DeleteEvent } from '@models/delete-event.model';
import { reDelSuccess, reDelInUse } from '@shared/vars';


@Component({
  selector: 'extensions-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [ExtensionService]
})
export class ExtensionsComponent implements OnInit {

  @ViewChild(ListComponent) list;

  pageInfo: ExtensionModel = new ExtensionModel();

  loading: {
    body: number,
    pagination: boolean,
    sidebar: boolean,
    admin: boolean,
    user: boolean
  };
  sidebar: ExtensionItem = null;
  selected: ExtensionItem;
  passwordTo: number;
  table: TableInfoExModel = new TableInfoExModel();
  text = MainViewComponent.prototype;
  modal = new ModalEx();
  filters: FilterItem[] = [];

  constructor(
    public service: ExtensionService,
    private messages: MessageServices,
    private translate: TranslateService
  ) {
    this.table.sort.isDown = false;
    this.table.sort.column = 'extension';
    this.table.items.push(new TableInfoItem(this.translate.instant('#Ext'), 'extension', 'extension', 80));
    this.table.items.push(new TableInfoItem(this.translate.instant('Phone number'), 'phone', 'phone'));
    this.table.items.push(new TableInfoItem(this.translate.instant('First Name'), 'userFirstName', 'userFirstName'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Last Name'), 'userLastName', 'userLastName'));
    this.table.items.push(new TableInfoItem(this.translate.instant('E-mail'), 'userEmail', 'userEmail'));
    this.table.items.push(new TableInfoItem(this.translate.instant('Status'), 'statusName', 'statusName', 80));
    this.table.items.push(new TableInfoItem(this.translate.instant('Default'), 'default', 'default', 80));
  }

  closeExt(): void {
    this.sidebar = null;
  }

  select(item: ExtensionItem) {
    if (!this.selected) {
      if (window.innerWidth > 1399) {
        this.sidebar = this.sidebar ? (this.sidebar.id === item.id ? null : item) : item;
      }
    }
  }

  sendPasswordToAdmin(item: ExtensionItem): void {
    this.selected = item;
    this.passwordTo = 1;
    this.modal = new ModalEx('', 'resetToAdmin');
    this.modal.visible = true;
  }

  sendPasswordToUser(item: ExtensionItem): void {
    this.selected = item;
    this.passwordTo = 2;
    this.modal = new ModalEx('', 'resetToUser');
    this.modal.visible = true;
  }

  confirmModal(): void {
    if (this.passwordTo > 0) {
      this.loading.admin = this.passwordTo === 1;
      this.loading.user = this.passwordTo === 2;
      this.service
        .changePassword(
          this.selected.id,
          { mobileApp: this.selected.mobileApp, toAdmin: this.passwordTo === 1, toUser: this.passwordTo === 2 }
        )
        .then(res => {
          const msg = this.translate.instant(res.message);
          this.messages.writeSuccess(msg);
          this.loading.admin = false;
          this.loading.user = false;
        });
    } else {
      this.service.deleteExtension(this.selected.id)
        .then(res => {
          // this.getList();
        });
    }
    this.cancelModal();
  }

  cancelModal() {
    this.selected = null;
    this.passwordTo = 0;
  }

  onDelete(event: DeleteEvent): void {
    if (!this.checkDeletionError(event.response)) {
      this.messages.writeSuccess(this.translate
        .instant('deleteExtensionConfirmation', { ext: event.item.phoneNumber }));
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
        .instant('extensionInUse', { module: module, name: match[2] });
      return message;
    }
    return this.translate.instant(response.message);
  }

  load() {
    this.sidebar = null;
    if (this.filters.length === 0) {
      // this.filters.push(new FilterItem(1, 'department', 'Department', this.list.pageInfo.departmentFilter, 'name', this.translate.instant('[choose one]')));
      const departmentsSelect = FilterItem.createSelectItem(
        1,
        'department',
        'Department',
        this.list.pageInfo.departmentFilter,
        'name',
        this.translate.instant('[choose one]'),
        true,
        'sipCount');
      this.filters.push(departmentsSelect);
      this.filters.push(new FilterItem(2, 'search', 'Search', null, null, this.translate.instant('Search by Name or Phone')));

      this.list.header.selectedFilter[0] = this.list.pageInfo.departmentFilter[0];
    }
    this.list.pageInfo.items.forEach(item => {
      item.statusName = this.translate.instant(item.statusName);
    });
  }

  ngOnInit(): void {
    this.loading = { body: 0, pagination: true, sidebar: true, admin: false, user: false };
  }

}
