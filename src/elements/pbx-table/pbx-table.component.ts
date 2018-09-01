import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import {TableInfoExModel, TableInfoItem, TableInfoModel} from '../../models/base.model';
import {ModalEx} from "../pbx-modal/pbx-modal.component";
import {PlayerAnimation} from "../../shared/player-animation";
import {FadeAnimation} from "../../shared/fade-animation";
import {str2regexp} from '../../shared/shared.functions';

@Component({
    selector: 'pbx-table',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        FadeAnimation('200ms'),
        PlayerAnimation
    ]
})

export class TableComponent implements OnInit {
    @Input() tableItems: any[];
    @Input() selected: any;
    @Input() tableInfo: TableInfoModel;
    @Input() tableInfoEx: TableInfoExModel;
    @Input() editable: boolean;
    @Input() deletable: boolean = true;
    @Input() multiple: boolean;
    @Input() columnFormat: string[];
    @Input() name: string;
    @Input() tableReload: number = 0;

    @Output() onSelect: EventEmitter<object> = new EventEmitter<object>();
    @Output() onEdit: EventEmitter<object> = new EventEmitter<object>();
    @Output() onDelete: EventEmitter<object> = new EventEmitter<object>();
    @Output() onPageChangeEx: EventEmitter<number> = new EventEmitter<number>();
    @Output() onSort: EventEmitter<object> = new EventEmitter<object>();
    @Output() onDropDown: EventEmitter<object> = new EventEmitter<object>();
    @Output() onDropDownClick: EventEmitter<object> = new EventEmitter<object>();
    @Output() onPlayerClick: EventEmitter<object> = new EventEmitter<object>();

    modal: ModalEx = new ModalEx('Are you sure?', 'delete');
    selectedDelete: any;
    dropDirection = '';

    isSelected(id: number): boolean {
        if (this.selected) {
            return !!this.selected.find(item => {
                return Number.isInteger(item) ? item === id : item.id === id;
            });
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
        if (this.name === 'Phone Number') {
            this.modal.body = '';
            let body: string;
            body = '';
            let innerCount;
            innerCount = 0;
            if (item.sipInners && item.sipInners.length > 0) {
                innerCount = item.sipInners.length;
            }
            body = body.concat('Are you sure you want to delete ', item.phoneNumber, ' and ', innerCount, ' Ext(s)?');
            this.modal.body = body;
        }
        this.modal.visible = true;
    }

    deleteItem(): void {
        this.onDelete.emit(this.selectedDelete);
    }

    getItemFormatting(item: any, tableItem: TableInfoItem, itemIndex: number): string {
        let css = '';
        
        if (!!this.columnFormat) css += ' ' + this.columnFormat[itemIndex];
        
        if (!!tableItem.dataWidth) css += ' fix_' + tableItem.dataWidth;
        else if (!!tableItem.width) css += ' fix_' + tableItem.width;
        
        if (tableItem.specialFormatting) {
            let value = this.getValueByKeyEx(item, tableItem.key);
            tableItem.specialFormatting.forEach(rule => {
                if (value.match(str2regexp(rule.pattern))) {
                    css += ' ' + rule.cssClass;
                }
            });
        }

        return css;
    }

    getValueByKeyEx(item: any, key: string): string {
        let result: any = this.getValueByKey(item, key);
        return result === true || result === false ? '' : result;
    }

    getValueByKey(item: any, key: string): string {
        const keyArray = key.split('.');
        keyArray.forEach(k => item = item && item[k]);
        return item;
    }

    changePage(): void {
        this.onPageChangeEx.emit();
    }

    sort(item: TableInfoItem) {
        if (item.sort) {
            this.tableInfoEx.sort.isDown = !(this.tableInfoEx.sort.column === item.sort && this.tableInfoEx.sort.isDown);
            this.tableInfoEx.sort.column = item.sort;
            this.onSort.emit(item);
        }
    }

    headerClass(item: TableInfoItem) {
        return [item.sort ? 'sort' : '', item.width ? ('fix' + item.width) : ''];
    }

    dropOpen(action, item) {
        let prev = item.ddShow;
        this.tableItems.forEach((item) => {
            item.ddShow = false;
        });
        this.onDropDown.emit({action: action, item: item});
        item.ddShow = prev === false;

        if ((this.tableItems.length - 4) < this.tableItems.indexOf(item)) {
            this.dropDirection = 'top';
        } else {
            this.dropDirection = 'bottom';
        }
    }

    dropClick(action, option, item) {
        this.onDropDownClick.emit({action: action, option: option, item: item});
    }

    mouseEnter(event, item) {
        // console.log('mouseEnter', item.id);

    }

    mouseLeave(event, item) {
        // console.log('mouseLeave', item.id);
    }

    /* ------------------------------------------------------
     * Media player
     * ------------------------------------------------------
     */

    playerClick(item) {
        this.onPlayerClick.emit(item);
    }

    playerOpenClose(item) {
        item.player.animationState = item.player.animationState === 'min' ? 'max' : 'min';
    }

    playerAnimationStart(item) {
        if (item) {
            // console.log('PLAYER_ANIMATION1', item.player.animationState);
            // console.log('PLAYER_ANIMATION2', item.player.contentShow);
            if (item.player.animationState === 'min') {
                item.player.contentShow = false;
            }
        }
    }

    playerAnimationEnd(item) {
        if (item) {
            item.player.contentShow = item.player.contentShow === false;
            if (item.player.animationState === 'min') {
                item.player.contentShow = false;
            }
        }
    }

    ngOnInit() {
        this.name ? this.modal.body = `Are you sure you want to delete this ${this.name}?` : null;
        if (!this.tableInfoEx) {
            this.tableInfoEx = new TableInfoExModel();
            for (let i = 0; i < this.tableInfo.titles.length; i++) {
                let item: TableInfoItem = {
                    title: this.tableInfo.titles[i],
                    key: this.tableInfo.keys[i],
                    width: null,
                    dataWidth: undefined,
                    sort: null,
                };
                this.tableInfoEx.items.push(item);
            }
        }
    }

}

