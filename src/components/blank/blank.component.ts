import {Component} from '@angular/core';
import {TableInfoModel} from '../../models/table-info.model';
import {SidebarInfo} from '../../models/sidebar-info.model';

@Component({
  selector: 'pbx-blank',
  template: `
            <pbx-button style="flex: 0 0 auto; margin-bottom: 16px"></pbx-button>
            <pbx-select
              style="flex: 0 0 auto; width: 300px; margin-bottom: 16px"
              [options]="selectOptions"
              [selected]="selectedOption"
              [objectKey]="'title'"
              [placeholder]="'Please select something'"
              (onSelect)="selectOption($event)"></pbx-select>
            <div style="flex-direction: row; width: 100%">
              <pbx-table [tableItems]="tableData"
                         [tableInfo]="tableInfo"
                         [selected]="selectedRow"
                         [editable]="true"
                         (onSelect)="selectItem($event)"
                         (onDelete)="deleteItem($event)"
                         (onEdit)="editItem($event)"
                          style="flex: 1 0 auto"></pbx-table>
              <pbx-sidebar [sidebarInfo]="sidebarInfo" style="flex: 0 0 auto;"></pbx-sidebar>
            </div>`
})

export class BlankComponent {
  selectedRow;
  selectedOption;
  sidebarInfo: SidebarInfo = {
    title: 'Information',
    description: [
      {title: 'Available space', value: '4Mb'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'},
      {title: 'Available external numbers', value: '16'}
    ]
  };
  /*
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet lectus diam. Nullam venenatis orci quis nisl lacinia, non bibendum risus egestas. Nullam magna lectus, semper venenatis ex ac, finibus vehicula nunc. In vitae laoreet leo. Cras ut magna in turpis feugiat ullamcorper a tincidunt magna. Quisque suscipit eros lacinia turpis laoreet, nec accumsan dolor consectetur. Maecenas imperdiet massa eu eros consequat placerat at eu eros.',
    'Phasellus a augue vel sapien efficitur consequat aliquam in lacus. Donec sit amet feugiat mi, at consequat dui. In id odio vel diam volutpat eleifend. Curabitur eu gravida nisl. Praesent nec mi eros. Sed accumsan elementum dolor vel suscipit. Duis non gravida ex. Vestibulum at varius justo. Donec condimentum est diam, vel elementum mauris pellentesque eu. Mauris enim dui, luctus ac luctus quis, ultrices in quam. Pellentesque tempus quis sapien eget tincidunt. Curabitur rhoncus malesuada neque. Nullam ac mi id nisl laoreet ultrices. Fusce quam enim, auctor vitae arcu eu, vestibulum efficitur tellus. Mauris ut faucibus diam.',
    'Nunc viverra auctor interdum. Aliquam erat volutpat. Integer vehicula sapien euismod leo interdum rutrum. Morbi pellentesque eu magna vitae fermentum. In auctor a tellus eget aliquam. Quisque lacus erat, eleifend sit amet scelerisque sit amet, blandit ac ante. Curabitur molestie arcu non dictum ultricies. Phasellus interdum vestibulum magna, eget rutrum sapien tempus sit amet. Duis blandit nunc a dolor sagittis maximus. Vestibulum fringilla et libero sit amet tempor.'
   */
  selectOptions = [
    {id: 1, title: 'Option 1', description: 'Select option 1'},
    {id: 2, title: 'Option 2', description: 'Select option 2'},
    {id: 3, title: 'Option 3', description: 'Select option 3'},
    {id: 4, title: 'Option 4', description: 'Select option 4'},
    {id: 5, title: 'Option 5', description: 'Select option 5'},
    {id: 6, title: 'Option 6', description: 'Select option 6'}
  ];
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
    this.selectedRow = item;
  }
  editItem(item): void {
    console.log('EDITED: \n', item);
    this.selectedRow = item;
  }
  deleteItem = (id): void => {
    console.log('DELETED: \n', id);
  }
  selectOption(object): void {
    this.selectedOption = object;
  }
}
