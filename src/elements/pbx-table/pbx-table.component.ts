import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableInfoModel} from '../../models/table-info.model';

@Component({
    selector: 'pbx-table',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class TableComponent {
    @Input() tableItems: any[];
    @Input() selected: any;
    @Input() tableInfo: TableInfoModel;
    @Input() editable: boolean;
    @Input() multiple: boolean;
    @Input() columnFormat: string[];

    @Output() onSelect: EventEmitter<object> = new EventEmitter<object>();
    @Output() onEdit: EventEmitter<object> = new EventEmitter<object>();
    @Output() onDelete: EventEmitter<object> = new EventEmitter<object>();
    @Output() onPageChangeEx: EventEmitter<number> = new EventEmitter<number>();

    modal = {
        visible: false,
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };
    selectedDelete: any;

    isSelected(id: number): boolean {
        if (this.selected) {
            return !!this.selected.find(item => item.id === id);
        }
    }

    selectItem(item): void {
        this.onSelect.emit(item);
    }

    editItem(item, ev: MouseEvent): void {
        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
        this.onEdit.emit(item);
    }

    clickDeleteItem(item, ev: MouseEvent) {
        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
        this.selectedDelete = item;
        this.modal.visible = true;
    }

    deleteItem(): void {
        this.onDelete.emit(this.selectedDelete);
    }

    getValueByKey(item: any, key: string): string {
        const keyArray = key.split('.');
        keyArray.forEach(k => item = item && item[k]);
        return item;
    }

    changePage(): void {
        this.onPageChangeEx.emit();
    }

}
