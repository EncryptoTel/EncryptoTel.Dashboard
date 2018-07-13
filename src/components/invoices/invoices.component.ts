import {Component, OnInit} from '@angular/core';
// import {InvoiceModel} from '../../models/invoice.model';
import {InvoiceServices} from '../../services/invoice.services';

@Component({
  selector: 'pbx-invoices',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [InvoiceServices]
})

export class InvoicesComponent implements OnInit {
  constructor(private _services: InvoiceServices) {}
  loading = false;
  pageinfo = {
    page: 1,
    total: null,
    limit: 10,
    items: null
  };
  table = {
    header: [
      {title: 'Invoice Number', key: '', width: false, sort: false},
      {title: 'Invoice Type', key: '', width: false, sort: false},
      {title: 'Transaction Date', key: 'date', width: false, sort: true},
      {title: 'Status', key: 'status', width: false, sort: true},
      {title: 'Amount (excl. VAT)', key: '', width: false, sort: false},
      {title: 'Amount', key: '', width: true, sort: false},
      {title: 'Transaction ID', key: '', width: false, sort: false},
      {title: '', key: '', width: true, sort: false}
    ],
    key: ['number', 'type', 'created', 'status', 'sumWithVat', 'sum', 'transaction'],
    data: [],
    sort: {column: 2, isDown: true}
  };

  SetSort(column: number) {
    if (this.table.header[column].sort) {
      this.loading = true;
      this.table.sort.isDown = !(this.table.sort.column === column && this.table.sort.isDown);
      this.table.sort.column = column;
      this.getInvoices();
    }
  }

  getInvoices() {
    this.loading = true;
    this.table.data = [];
    // console.log(this.table.header[this.table.sort.column].key);
    this._services.getInvoices(this.pageinfo, this.table.header[this.table.sort.column].key,
      this.table.sort.isDown ? 'down' : 'up').then(res => {
      this.table.data = res.items;
      this.pageinfo.total = res.pageCount;
      this.pageinfo.items = res.itemCount;
      this.loading = false;
    });
  }

  setPage(page: number) {
    this.pageinfo.page = page;
    this.getInvoices();
  }

  selectLimit(limit: number) {
    this.pageinfo.page = 1;
    this.pageinfo.limit = limit;
    this.getInvoices();
  }

  pdf(): void {
  }

  pay(): void {
  }

  viewInvoice(): void {
  }


  ngOnInit(): void {
    this.getInvoices();
  }
}
