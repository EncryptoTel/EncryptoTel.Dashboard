import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {PageInfoModel} from '../../models/base.model';


@Component({
    selector: 'pbx-pagination',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})
export class PaginationComponent implements OnInit {
    limitSelectorOptions: number[];
    limitSelectorVisible: boolean;

    @Input() currentPage: number; // Todo проверить на наличие этих двух полей все компоненты и удалить
    @Input() totalPages: number;
    @Input() pageInfo: PageInfoModel;

    @Output() onPageChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() onLimitSelect: EventEmitter<number> = new EventEmitter<number>();
    @Output() onPageChangeEx: EventEmitter<any> = new EventEmitter<any>();

    // -- component lifecycle methods -----------------------------------------

    constructor() {}

    ngOnInit(): void {
        this.initLimitSelector();
    }

    initLimitSelector(): void {
        this.limitSelectorOptions = [ 10, 20, 30, 40, 50 ];
        // Should limit selector to be used for quick nvigation through pages, 
        // the code below may be taken.
        // for (let number = 1; number <= this.pageInfo.pageCount; ++ number) {
        //     this.limitSelectorOptions.push(number * this.pageInfo.limit);
        // }
        this.limitSelectorVisible = false;
    }

    // -- event handlers ------------------------------------------------------

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
        if (!this.limitSelectorVisible /*|| !this.isInCurrentPage(limit)*/)
            return;

        this.limitSelectorVisible = false;

        this.pageInfo.limit = limit;
        if (this.onLimitSelect.observers.length > 0) {
            this.onLimitSelect.emit(limit);
        } else {
            this.changePage(1);
        }
    }

    hideLimitSelector(): void {
        this.limitSelectorVisible = false;
    }

    toggleLimitSelector(): void {
        this.limitSelectorVisible = !this.limitSelectorVisible;
    }

    // -- component methods ---------------------------------------------------

    get firstItemNumber(): number {
        return (this.pageInfo.page - 1) * this.pageInfo.limit + 1;
    }

    get lastItemNumber(): number {
        return this.min(this.pageInfo.itemsCount, this.pageInfo.page * this.pageInfo.limit);
    }

    get currentPageRange(): string {
        return this.firstItemNumber + '-' + this.lastItemNumber;
    }

    get isVisible(): boolean {
        return !!this.pageInfo && this.pageInfo.visible !== false && this.pageInfo.itemsCount > this.pageInfo.limit;
    }

    get canMoveToFirst(): boolean {
        return this.pageInfo.page !== 1;
    }

    get canMoveBack(): boolean {
        return this.pageInfo.page > 1;
    }

    get canMoveForward(): boolean {
        return this.pageInfo.page < this.pageInfo.pageCount;
    }

    get canMoveToLast(): boolean {
        return this.pageInfo.page !== this.pageInfo.pageCount;
    }

    moveToFirst(): void {
        if (!this.canMoveToFirst) 
            return;
        this.changePage(1);
    }

    moveBack(): void {
        if (!this.canMoveBack)
            return;
        this.changePage(this.pageInfo.page - 1);
    }

    moveForward(): void {
        if (!this.canMoveForward)
            return;
        this.changePage(this.pageInfo.page + 1);
    }

    moveToLast(): void {
        if (!this.canMoveToLast)
            return;
        this.changePage(this.pageInfo.pageCount);
    }

    // Should limit selector to be used for quick nvigation through pages, 
    // the code below can be taken.
    isInCurrentPage(index: number): boolean {
        return index >= this.firstItemNumber && index <= this.pageInfo.page * this.pageInfo.limit;
    }

    isCurrentLimit(limit: number): boolean {
        return limit === this.pageInfo.limit;
    }

    min(a: number, b: number): number {
        return a > b ? b : a;
    }
}
