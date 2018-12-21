import {Component, OnInit, ViewChild} from '@angular/core';
import {InvoiceService} from '../../services/invoice.service';
import {InvoiceModel} from '../../models/invoice.model';
import {ButtonItem, TableInfoExModel, TableInfoItem} from '../../models/base.model';
import {ListComponent} from '../../elements/pbx-list/pbx-list.component';
import {getInterval} from '../../shared/shared.functions';
import {TranslateService} from '@ngx-translate/core';
import {formatDateTime} from '@shared/shared.functions';
import {LocalStorageServices} from '@services/local-storage.services';

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
    dateFormat: any;

    constructor(public service: InvoiceService,
                public translate: TranslateService,
                private storage: LocalStorageServices) {

        this.dateFormat = this.storage.readItem('dateTimeFormat');
        this.table.sort.isDown = true;
        this.table.sort.column = 'date';
        this.table.items.push(new TableInfoItem(this.translate.instant('Invoice Number'), 'number', 'number'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Invoice Type'), 'type', 'type'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Transaction Date'), 'displayDateTime', 'date'));
        const statusColumn = new TableInfoItem(this.translate.instant('Status'), 'status', 'status');
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
            if (item.status === 'Waiting for payment') {
                item.status = '<span class="' + item.status + '">' + this.translate.instant(item.status) + '</span>';
            } else {
                item.status = this.translate.instant(item.status);
            }

            item.type = this.translate.instant(item.type);
            item.created = formatDateTime(item.created, this.dateFormat.toUpperCase().replace('HH:MM:SS', 'HH:mm:ss'));

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
