import {Component, OnInit, ViewChild} from '@angular/core';
import {InvoiceService} from '../../services/invoice.service';
import {InvoiceModel} from "../../models/invoice.model";
import {TableInfoExModel, TableInfoItem} from "../../models/base.model";
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
    table: TableInfoExModel = new TableInfoExModel();
    buttons: ButtonItem[] = [];

    constructor(private service: InvoiceService) {
        this.table.sort.isDown = false;
        this.table.sort.column = 'date';
        this.table.items.push(new TableInfoItem('Invoice Number', 'number'));
        this.table.items.push(new TableInfoItem('Invoice Type', 'type'));
        this.table.items.push(new TableInfoItem('Transaction Date', 'dateTime', 'date'));
        this.table.items.push(new TableInfoItem('Status', 'status'));
        this.table.items.push(new TableInfoItem('Amount (excl. VAT)', 'sumWithVat', 'amount'));
        this.table.items.push(new TableInfoItem('Amount', 'sum', 'amount_vat'));
        this.table.items.push(new TableInfoItem('Transaction ID', 'transaction'));

        this.buttons.push({
            id: 0,
            title: '',
            type: 'cancel',
            visible: true,
            inactive: false
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
