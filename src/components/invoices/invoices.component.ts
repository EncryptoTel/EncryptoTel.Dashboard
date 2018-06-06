import {Component} from '@angular/core';


@Component({
  selector: 'pbx-invoices',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class InvoicesComponent {
  constructor() {
    this.markForWaitingPayment();
  }

  tableInfo = {
    titles: ['Invoice Number', 'Invoice type', 'Transaction date', 'Status', 'Amount (excl. VAT)', 'Amount', 'Transaction ID'],
    keys: ['number', 'type', 'date', 'status', 'amount_vat', 'amount', 'transaction']
  };

  page = 1;
  max_page = 3;
  invoices = [
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'refill balance',
      date: '01/07/2017 14:47:25',
      status: 'waiting payment',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'canceled',
      amount_vat: '68.00',
      amount: '150.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
    {
      number: 'TC00001729',
      type: 'bill',
      date: '01/07/2017 14:47:25',
      status: 'paid',
      amount_vat: '68.00',
      amount: '68.00',
      transaction: 're4dqweqweqsk8m'
    },
  ];
  sorting = 'down';
  showPagination = true;
  waitingPayment: boolean[] = [];

  sort() {
    this.sorting = this.sorting === 'up' ? 'down' : 'up';
  }

  getPDF() {
  }

  getPay() {
  }
  getValueByKey(item: any, key: string): string {
    const keyArray = key.split('.');
    keyArray.forEach(k => item = item && item[k]);
    return item;
  }
  markForWaitingPayment() {
    this.invoices.map(el => {
      el.status === 'waiting payment' ? this.waitingPayment.push(true) : this.waitingPayment.push(false);
    });
  }
}
