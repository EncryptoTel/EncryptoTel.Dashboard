import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'pbx-pagination',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class PaginationComponent {

    @Input() currentPage: number;
    @Input() totalPages: number;

    @Output() onPageChange: EventEmitter<number> = new EventEmitter<number>();

    changePage(page: number): void {
        if (page !== this.currentPage) {
            this.onPageChange.emit(page);
        }
    }
}
