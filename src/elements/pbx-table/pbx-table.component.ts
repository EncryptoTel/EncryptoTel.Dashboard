import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableInfoModel} from '../../models/table-info.model';

@Component({
  selector: 'pbx-table',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class TableComponent {
  @Input() tableItems: any[];
  @Input() selected: object;
  @Input() tableInfo: TableInfoModel;
  @Input() editable: boolean;
  @Output() onSelect: EventEmitter<object> = new EventEmitter<object>();
  @Output() onEdit: EventEmitter<object> = new EventEmitter<object>();
  @Output() onDelete: EventEmitter<number> = new EventEmitter<number>();
  selectItem(item): void {
    this.onSelect.emit(item);
  }
  editItem(item): void {
    this.onEdit.emit(item);
  }
  deleteItem(id): void {
    this.onDelete.emit(id);
  }
}
