import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PhoneNumbersServices} from '../../../services/phone-numbers.services';
import {calculateHeight} from '../../../shared/shared.functions';

@Component({
  selector: 'buy-phone-numbers-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [PhoneNumbersServices]
})

export class BuyPhoneNumbersComponent implements OnInit {

  loading: boolean;

  list: any[];

  requestDetails: {
    countryCode: string;
    search: string,
    page: number,
    limit: number
  };

  pagination: {
    page: number;
    total: number;
  };

  searchTimeout;

  @ViewChild('row') row: ElementRef;
  @ViewChild('table') table: ElementRef;

  constructor(private _services: PhoneNumbersServices) {
    this.pagination = {page: 1, total: 1};
  }

  getList(): void {
    this.loading = true;
    this._services.getAvailableNumbersList(this.requestDetails)
      .then(res => {
        // this.list = [res['items'].slice(0, this.requestDetails.limit / 2), res['items'].slice(this.requestDetails.limit / 2)];
        this.list = [res['numbers'].slice(0, this.requestDetails.limit / 2), res['numbers'].slice(this.requestDetails.limit / 2)];
        // console.log(this.list);
        this.pagination.total = 1;//res.pages;
        this.loading = false;
      });
  }

  searchInit() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.pagination.page = this.requestDetails.page = 1;
      this.getList();
    }, 500);
  }

  onPageChange(page: number): void {
    this.pagination.page = this.requestDetails.page = page;
    this.getList();
  }

  buyItem(number): void {
    number.loading = true;
    this._services.buyNumber(number.params)
      .then(() => {
        number.loading = false;
        number.inactive = true;
      }).catch();
  }

  ngOnInit() {
    this.requestDetails = {
      countryCode: 'US',
      search: '',
      page: 1,
      //limit: calculateHeight(this.table, this.row) * 2
      limit: 50
    };
    this.getList();
    this.pagination.page = 1;
  }
}
