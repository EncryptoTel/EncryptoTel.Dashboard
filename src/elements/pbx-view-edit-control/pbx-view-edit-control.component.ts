import { Component, Input, Output, EventEmitter, OnInit, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FadeAnimation } from '@shared/fade-animation';
import { ModalEx } from '@elements/pbx-modal/pbx-modal.component';
import { MessageServices } from '@services/message.services';


export interface ITableInfo {
  keys: string[];
  titles: string[];
}

@Component({
  selector: 'pbx-view-edit-control',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})
export class ViewEditControlComponent implements OnInit {

  editMode: boolean;
  modal: ModalEx;
  addMembersCount: number = 0;
  tableInfoSelected: ITableInfo;

  @Input() headerText: string;
  @Input() buttonText: string;
  @Input() noDataMessage: string = 'Nothing found';
  @Input() parentEditMode: boolean = true;

  @Input() tableInfo: ITableInfo;
  @Input() items: any[];
  @Input() selectedItems: any[];

  @Output() onEditModeChanged: EventEmitter<boolean>;

  nothingFoundText: string;

  get hasData(): boolean {
    return !!this.selectedItems && this.selectedItems.length > 0;
  }

  get allSelected(): boolean {
    return this.items.length === this.selectedItems.length;
  }

  constructor(
    public translate: TranslateService,
    public messages: MessageServices
  ) {
    this.editMode = false;
    this.onEditModeChanged = new EventEmitter();
    this.addMembersCount = 0;

    this.nothingFoundText = this.translate.instant('Nothing found');
    this.modal = new ModalEx('', 'delete');
    this.modal.body = this.translate.instant('Are you sure you want to delete this member?');
  }

  ngOnInit(): void {
    if (this.tableInfo) {
      this.tableInfoSelected = {
        keys: this.tableInfo.keys.slice(1),
        titles: this.tableInfo.titles.slice(1)
      };
    }
  }

  toggleEditMode(): void {
    if (this.editMode && this.addMembersCount > 0) {
      const confirmation: string = this.translate
        // .instant('departmentMembersAddedMessage', { count: this.addMembersCount });
        .instant('departmentMembersAddedMessage', { count: this.selectedItems.length });
      this.messages.writeSuccess(confirmation);
      this.addMembersCount = 0;
    }

    this.editMode = !this.editMode;
    this.onEditModeChanged.emit(this.editMode);
  }

  selectItem(item: any): void {
    if (!this.selectedItems) this.selectedItems = [];
    if (this.isSelected(item)) {
      this.deleteSelectedItem(item);
    }
    else {
      this.selectedItems.push(item);
      this.addMembersCount++;
    }
  }

  toggleAll(selectAll: boolean): void {
    this.selectedItems = [];
    if (selectAll) {
      this.items
        .forEach(item => this.selectedItems.push(item));
    }
  }

  isSelected(item: any): boolean {
    return this.selectedItems.find(i => i.id === item.id) ? true : false;
  }

  delete(item: any): void {
    this.modal.confirmCallback = () => {
      this.deleteSelectedItem(item);
    };
    this.modal.show();
  }

  deleteSelectedItem(item: any): void {
    this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
  }
}
