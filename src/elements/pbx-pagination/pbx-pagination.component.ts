import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'pbx-pagination',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class PaginationComponent {
    @Input() currentPage: number; // Todo проверить на наличие этих двух полей все компоненты и удалить
    @Input() totalPages: number;
    @Input() pageInfo: {
      visible: boolean,
      page: number,
      total: number,
      limit: number,
      items: number};

    @Output() onPageChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() onLimitSelect: EventEmitter<number> = new EventEmitter<number>();

    option = [10, 20, 30, 40, 50];
    showWrap = 0;
    changePage(page: number): void {
        if (page !== this.pageInfo.page) {
            this.onPageChange.emit(page);}
    }
    selectLimit(limit: number): void {
        this.showWrap = 2;
        this.onLimitSelect.emit(limit);
    }
    min(a: number, b: number): number {
        return a > b ? b : a;
    }

}
