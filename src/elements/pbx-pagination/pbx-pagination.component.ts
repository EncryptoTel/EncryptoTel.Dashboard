import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PageInfoModel} from "../../models/base.model";

@Component({
    selector: 'pbx-pagination',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class PaginationComponent {
    @Input() currentPage: number; // Todo проверить на наличие этих двух полей все компоненты и удалить
    @Input() totalPages: number;
    @Input() pageInfo: PageInfoModel;

    @Output() onPageChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() onLimitSelect: EventEmitter<number> = new EventEmitter<number>();
    @Output() onPageChangeEx: EventEmitter<any> = new EventEmitter<any>();

    option = [10, 20, 30, 40, 50];
    showWrap = 0;
    changePage(page: number): void {
        if (this.onPageChangeEx.observers.length > 0) {
            this.pageInfo.page = page;
            this.onPageChangeEx.emit(page);
        } else {
            if (page !== this.pageInfo.page) {
                this.onPageChange.emit(page);
            }
        }
    }

    selectLimit(limit: number): void {
        this.showWrap = 2;
        if (this.onLimitSelect.observers.length > 0) {
            this.onLimitSelect.emit(limit);
        } else {
            this.pageInfo.limit = limit;
            this.changePage(this.pageInfo.page)
        }
    }

    min(a: number, b: number): number {
        return a > b ? b : a;
    }

}
