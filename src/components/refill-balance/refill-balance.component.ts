import {Component, OnInit} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'refill-balance',
  templateUrl: './template.html',
  animations: [FadeAnimation('300ms')],
  styleUrls: ['./local.sass']
})
export class RefillBalanceComponent implements OnInit {
  loading: {
    body: boolean,
    sidebar: boolean,
  };
  refill_status = 'main'; // main, paying, processing
  amount = {min: 5, max: 10000};
  payment_address = '039rv8nciun9v8u2neijwncoiwnd928un298uefn2039nroixjn';
  currency = [
    {id: 1, title: 'Bitcoin',          code: null,  discount: null, icon: ''},
    {id: 2, title: 'ETT Ethereum',     code: null,  discount: 0.1,  icon: ''},
    {id: 3, title: 'Ethereum',         code: 'eth', discount: null, icon: ''},
    {id: 4, title: 'Ethereum Classic', code: 'etc', discount: null, icon: ''},
    {id: 7, title: 'Litecoin',         code: 'ltc', discount: null, icon: ''},
    {id: 6, title: 'Waves',            code: null,  discount: null, icon: ''},
    {id: 8, title: 'ETT Waves',        code: null,  discount: 0.1,  icon: ''},
  ];
  balance = [
    {id: 0, title: 'Dollar', value: 58},
    {id: 2, title: 'ETT', value: 0.0000061}
  ];
  rates = [
    {id: 0, code: 'usd', title: 'U.S. dollars', value: 100},
    {id: 1, code: 'btc', title: 'Bitcoin', value: 0.03707466},
    {id: 2, code: 'ett', title: 'ETT', value: 931.43692775},
    {id: 3, code: 'eth', title: 'Ethereum', value: 0.45617108},
    {id: 4, code: 'etc', title: 'Ethereum Classic', value: 6.81984028},
    {id: 7, code: 'ltc', title: 'Litecoin', value: 2.36163198},
    {id: 6, code: null, title: 'Waves', value: 30.76260498}
  ]; //
  picked_currency;
  invoice_number = 'TC10002258';
  modal = {
    visible: false,
    title: 'Confirm payment',
    confirm: {type: 'success', value: 'Yes'},
    decline: {type: 'cancel', value: 'No'}
  };

  Pay(): void {
    this.refill_status = 'processing';
  }

  findById(id: number, array: any) {
    for (let i = 0; i < array.length; i++) {
      if (id === array[i].id) {
        return array[i]; }}
    console.log('object not found');
    return null;
  }

  ngOnInit(): void {
    this.loading = {body: true, sidebar: true};


    this.loading.body = false;
    this.loading.sidebar = false;
  }
}
