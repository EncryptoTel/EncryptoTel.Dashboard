import {Component, OnInit, ViewChild} from '@angular/core';
import {InvoiceService} from '../../services/invoice.service';
import {InvoiceModel} from "../../models/invoice.model";
import {ButtonItem, TableInfoExModel, TableInfoItem} from "../../models/base.model";
import {ListComponent} from "../../elements/pbx-list/pbx-list.component";
import {getInterval} from "../../shared/shared.functions";

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

    constructor(public service: InvoiceService) {
        this.table.sort.isDown = false;
        this.table.sort.column = 'date';
        this.table.items.push(new TableInfoItem('Invoice Number', 'number'));
        this.table.items.push(new TableInfoItem('Invoice Type', 'type'));
        this.table.items.push(new TableInfoItem('Transaction Date', 'displayDateTime', 'date'));
        let statusColumn = new TableInfoItem('Status', 'status');
        statusColumn.specialFormatting = [{
            pattern: '/waiting for payment/i',
            cssClass: 'waiting-status'
        }];
        this.table.items.push(statusColumn);
        this.table.items.push(new TableInfoItem('Amount (excl. VAT)', 'sumWithVat', 'amount'));
        this.table.items.push(new TableInfoItem('Amount', 'sum', 'amount_vat'));
        // this.table.items.push(new TableInfoItem('Transaction ID', 'transaction'));

        this.buttons.push({
            id: 0,
            title: '',
            type: 'cancel',
            visible: false,
            inactive: false
        });
    }

    getInterval() {
        return getInterval(this.list.pageInfo.items, 'created', 'displayDate');
    }

    load() {
        this.buttons[0].title = this.getInterval();
        this.buttons[0].visible = true;
    }

    create() {

    }

    select() {

    }

    ngOnInit() {

    }
}
