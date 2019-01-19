import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { RefsServices } from '@services/refs.services';
import { PhoneNumberService } from '@services/phone-number.service';
import { MessageServices } from '@services/message.services';
import { UserServices } from '@services/user.services';
import { CountryModel } from '@models/country.model';
import { ModalEx, ModalButton } from '@elements/pbx-modal/pbx-modal.component';


@Component({
  selector: 'buy-phone-numbers-component',
  templateUrl: './template.html',
  styleUrls: [ './local.sass' ],
  providers: [ PhoneNumberService ]
})
export class BuyPhoneNumbersComponent implements OnInit {
  loading: number;
  list: any[];
  requestDetails: {
    countryCode: string;
    areaCode: string;
    contains: string;
    page: number;
    limit: number;
    local: boolean;
    mobile: boolean;
    tollFree: boolean;
  };
  pagination: {
    page: number;
    total: number;
  };
  modal = new ModalEx('', 'buyNumber');
  searchTimeout;
  selected;
  countries: CountryModel[] = [];
  selectedCountry: CountryModel;
  matches: any[];
  title = [
    this.translate.instant('Number'),
    this.translate.instant('Location'),
    this.translate.instant('Type'),
    this.translate.instant('Monthly'),
    this.translate.instant('Buy')
  ];

  @ViewChild('row') row: ElementRef;
  @ViewChild('table') table: ElementRef;

  @HostListener('window:keydown', [ '$event' ])
  keyEvent(event: KeyboardEvent) {
    const specialKeys: string[] = [ 'Backspace', 'Tab', 'End', 'Home' ];
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    const elementId: string = document.activeElement.getAttribute('id');
    if (!+event.key && elementId && elementId.includes('contains')) {
      event.preventDefault();
    }
  }

  constructor(
    private _services: PhoneNumberService,
    private refs: RefsServices,
    private message: MessageServices,
    private userService: UserServices,
    public translate: TranslateService,
    private router: Router
  ) {
    this.pagination = { page: 1, total: 1 };
    this.matches = [
      { id: 0, title: this.translate.instant('Any part of number') }
    ];
  }

  ngOnInit(): void {
    this.loading = 0;

    this.requestDetails = {
      countryCode: 'US',
      areaCode: '',
      contains: '',
      page: 1,
      limit: 40,
      local: false,
      mobile: false,
      tollFree: false
    };
    this.getList();
    this.getCountries();

    this.pagination.page = 1;
  }

  selectCountry(country: CountryModel) {
    this.selectedCountry = country;
    this.requestDetails.countryCode = country.code;
    this.getList();
  }

  getList(): void {
    this.loading++;
    this._services
      .getAvailableNumbersList(this.requestDetails)
      .then(res => {
        this.requestDetails.limit = res[ 'numbers' ].length;
        const remainder = res[ 'numbers' ].length % 2;
        let part1 = this.requestDetails.limit / 2;
        if (remainder > 0) {
          part1 = part1 + remainder;
        }
        this.list = [
          res[ 'numbers' ].slice(0, part1),
          res[ 'numbers' ].slice(part1)
        ];
        this.pagination.total = 1;
        this.loading--;
      });
  }

  searchInit() {
    this.loading++;
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
      this.loading--;
    }
    this.searchTimeout = setTimeout(() => {
      this.pagination.page = this.requestDetails.page = 1;
      this.getList();
      this.loading--;
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }, 500);
  }

  onPageChange(page: number): void {
    this.pagination.page = this.requestDetails.page = page;
    this.getList();
  }

  buyItem(number): void {
    if (number.sum > this.userService.user.balance.balance) {
      this.modal.title = this.translate.instant(this.modal.title);
      this.modal.body =
        this.translate.instant('You do not have enough money to buy the number.') + ' <br/>' + this.translate.instant('Please refill your balance.');
      this.modal.buttons = [
        new ModalButton('cancel', this.translate.instant('Cancel')),
        new ModalButton('success', this.translate.instant('Refill')) ];
      this.modal.confirmCallback = () => {
        this.router.navigate([ 'cabinet', 'refill' ]);
      };
      this.modal.visible = true;
    } else {
      this.selected = number;
      this.modal.title = this.translate.instant(this.modal.title);
      this.modal.body = this.translate.instant('Are you sure you want to buy') + ' <br>+' + number.fullNumber + '?';

      this.modal.visible = true;
    }
  }

  modalConfirm(): void {
    this.selected.loading = true;
    let phoneNumber: any;
    phoneNumber = this.selected;
    this._services
      .buyNumber(this.selected.params)
      .then(() => {
        this.selected.loading = false;
        this.selected.inactive = true;
        this.message.writeSuccess(this.translate.instant('phoneNumberPurchase', { phone: phoneNumber.params.phoneNumber }));
      })
      .catch(() => {
        this.selected.loading = false;
      });
  }

  private getCountries(): void {
    this.refs
      .getCountries()
      .then(res => {
        if (this.countries.length === 0) {
          this.countries = res;
          this.countries.forEach(country => {
            if (country.phoneCode) {
              country.title =
                country.title + ' (+' + country.phoneCode + ')';
            }
          });
        }
        this.selectedCountry = this.countries.find(
          country => country.code === 'US'
        );
      })
      .catch(err => {
        // console.error(err);
        // this.loading = false;
      });
  }

  checkboxClick(type) {
    if (type === 'local') {
      this.requestDetails.local = !this.requestDetails.local;
    }
    else if (type === 'mobile') {
      this.requestDetails.mobile = !this.requestDetails.mobile;
    }
    else if (type === 'tollFree') {
      this.requestDetails.tollFree = !this.requestDetails.tollFree;
    }
  }
}
