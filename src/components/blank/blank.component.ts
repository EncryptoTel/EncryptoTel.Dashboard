import {Component} from '@angular/core';
import {TableInfoModel} from '../../models/table-info.model';

@Component({
  selector: 'pbx-blank',
  template: `<pbx-table [tableItems]="tableData"
                        [tableInfo]="tableInfo"
                        [selected]="selected"
                        [editable]="true"
                        (onSelect)="selectItem($event)"
                        (onDelete)="deleteItem($event)"
                        (onEdit)="editItem($event)"></pbx-table>`
})

export class BlankComponent {
  selected;
  tableData = [
    {id: 1, name: '123123', value: 'value1', additionalData: '1', hiddenValue: 'hidden'},
    {id: 2, name: '123123', value: 'value2', additionalData: '2', hiddenValue: 'hidden'},
    {id: 3, name: '123123', value: 'value3', additionalData: '3', hiddenValue: 'hidden'},
    {id: 4, name: '123123', value: 'value4', additionalData: '4', hiddenValue: 'hidden'},
    {id: 5, name: '123123', value: 'value5', additionalData: '5', hiddenValue: 'hidden'},
    {id: 6, name: '123123', value: 'value6', additionalData: '6', hiddenValue: 'hidden'},
    {id: 7, name: '123123', value: 'value7', additionalData: '7', hiddenValue: 'hidden'},
    {id: 8, name: '123123', value: 'value8', additionalData: '8', hiddenValue: 'hidden'}
  ];
  tableInfo: TableInfoModel = {
    titles: ['name', 'value', 'info'],
    keys: ['name', 'value', 'additionalData']
  };
  selectItem(item): void {
    this.selected = item;
  }
  editItem(item): void {
    console.log('EDITED: \n', item);
    this.selected = item;
  }
  deleteItem = (id): void => {
    console.log('DELETED: \n', id);
  }
}
