import {Component, OnInit, ViewChild} from '@angular/core';
import {InvoiceService} from '../../services/invoice.service';
import {InvoiceModel} from "../../models/invoice.model";
import {TableInfoExModel} from "../../models/base.model";
import {ListComponent} from "../../elements/pbx-list/pbx-list.component";
import {ButtonItem} from "../../elements/pbx-header/pbx-header.component";

@Component({
    selector: 'pbx-invoices',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [InvoiceService]
})

export class InvoicesComponent implements OnInit {

    @ViewChild(ListComponent) list;
    loading = 0;
    pageInfo: InvoiceModel = new InvoiceModel();
    table: TableInfoExModel = {
        sort: {
            isDown: false,
            column: 'date',
        },
        items: [
            {title: 'Invoice Number', key: 'number', width: null, sort: null},
            {title: 'Invoice Type', key: 'type', width: null, sort: null},
            {title: 'Transaction Date', key: 'dateTime', width: null, sort: 'date'},
            {title: 'Status', key: 'status', width: null, sort: null},
            {title: 'Amount (excl. VAT)', key: 'sumWithVat', width: null, sort: 'amount'},
            {title: 'Amount', key: 'sum', width: null, sort: 'amount_vat'},
            {title: 'Transaction ID', key: 'transaction', width: null, sort: null},
        ]
    };
    buttons: ButtonItem[] = [];

    constructor(private service: InvoiceService) {
        this.buttons.push({
            id: 0,
            title: '',
            type: 'cancel',
        });
    }

    getInterval() {
        let max = null;
        let min = null;
        if (this.list.pageInfo) {
            for (let i in this.list.pageInfo.items) {
                let item = this.list.pageInfo.items[i];
                min = !min || item.created < min.created ? item : min;
                max = !max || item.created > max.created ? item : max;
            }
        }
        return max && min ? `${min.date} - ${max.date}` : '';
    }

    load() {
        this.buttons[0].title = this.getInterval();
    }

    create() {

    }

    select() {

    }

    ngOnInit() {

    }
}
