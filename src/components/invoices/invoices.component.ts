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
    sorting = 'down';
    showPagination = true;

    sort() {
        this.sorting = this.sorting === 'up' ? 'down' : 'up';
    }

    getInvoices() {
        this.invoices = [];
        this._services.getInvoices()
            .then(res => {
                res.map(invoice => {
                    this.invoices.push({
                        number: invoice.id,
                        type: 'Order',
                        date: invoice.created,
                        status: 'Paid',
                        amount: invoice.sum,
                        amount_vat: invoice.sumWithVat,
                        transaction: ''
                    });
                });
            }).catch();
    }

    ngOnInit(): void {
        this.getInvoices();
    }
}
