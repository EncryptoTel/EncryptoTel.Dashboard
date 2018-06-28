import {Component, OnInit} from '@angular/core';
import {InvoiceModel} from '../../models/invoice.model';
import {InvoiceServices} from "../../services/invoice.services";

@Component({
    selector: 'pbx-invoices',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [InvoiceServices]
})

export class InvoicesComponent implements OnInit {
    constructor(private _services: InvoiceServices) {
    }

    invoices: InvoiceModel[];
    sort = '';
    sortDirection = '';
    showPagination = true;
    page = 1;
    pages = 1;
    loading = false;

    setSort(sort: string) {
        if (this.sort === sort) {
            if (this.sortDirection === 'down') {
                this.sortDirection = 'up';
            } else {
                this.sort = '';
            }

        } else {
            this.sort = sort;
            this.sortDirection = 'down';
        }
        this.getInvoices();
    }

    getInvoices() {
        this.loading = true;
        this.invoices = [];
        this._services.getInvoices(this.page, this.sort, this.sortDirection)
            .then(res => {
                res['items'].map(invoice => {
                    this.invoices.push({
                        number: invoice.number,
                        type: 'Order',
                        date: invoice.created,
                        status: 'Paid',
                        amount: invoice.sum,
                        amount_vat: invoice.sumWithVat,
                        transaction: ''
                    });
                });
                this.page = res['page'];
                this.pages = res['pageCount'];
                this.loading = false;
            }).catch();
    }

    setPage(page: number) {
        if (page > 0 && page != this.page && page <= this.pages) {
            this.page = page;
            this.getInvoices();
        }
    }

    ngOnInit(): void {
        this.getInvoices();
    }
}
