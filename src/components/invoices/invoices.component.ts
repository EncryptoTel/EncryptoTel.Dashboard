import {Component, OnInit, ViewChild} from '@angular/core';
import {InvoiceService} from '../../services/invoice.service';
import {InvoiceModel} from '../../models/invoice.model';
import {ButtonItem, TableInfoExModel, TableInfoItem} from '../../models/base.model';
import {ListComponent} from '../../elements/pbx-list/pbx-list.component';
import {getInterval} from '../../shared/shared.functions';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'pbx-invoices',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [InvoiceService]
})

export class InvoicesComponent implements OnInit {

    @ViewChild(ListComponent) list;

    loading: number = 0;
    pageInfo: InvoiceModel = new InvoiceModel();
    table: TableInfoExModel = new TableInfoExModel();
    buttons: ButtonItem[] = [];

    constructor(public service: InvoiceService, public translate: TranslateService) {
        this.table.sort.isDown = true;
        this.table.sort.column = 'date';
        this.table.items.push(new TableInfoItem(this.translate.instant('Invoice Number'), 'number'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Invoice Type'), 'type'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Transaction Date'), 'displayDateTime', 'date'));
        const statusColumn = new TableInfoItem(this.translate.instant('Status'), 'status');
        statusColumn.specialFormatting = [{
            pattern: '/waiting for payment/i',
            cssClass: 'waiting-status'
        }];
        this.table.items.push(statusColumn);
        this.table.items.push(new TableInfoItem(this.translate.instant('Amount (excl. VAT)'), 'sumWithVat', 'amount'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Amount'), 'sum', 'amount_vat'));
        // this.table.items.push(new TableInfoItem('Transaction ID', 'transaction'));

        this.buttons.push({
            id: 0,
            title: '',
            type: 'cancel',
            visible: false,
            inactive: false,
            buttonClass: '',
            icon: false
        });
    }

    getInterval() {
        return getInterval(this.list.pageInfo.items, 'created', 'displayDate');
    }

    load() {

        this.list.pageInfo.items.forEach( item => {
            item.status = this.translate.instant(item.status);
            item.type = this.translate.instant(item.type);
        });

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
