import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {PhoneNumberService} from '../../../services/phone-number.service';
import {CountryModel} from '../../../models/country.model';
import {RefsServices} from '../../../services/refs.services';
import {ModalEx} from '../../../elements/pbx-modal/pbx-modal.component';

@Component({
    selector: 'buy-phone-numbers-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PhoneNumberService]
})

export class BuyPhoneNumbersComponent implements OnInit {

    loading: number;

    list: any[];

    requestDetails: {
        countryCode: string,
        areaCode: string,
        contains: string,
        page: number,
        limit: number,
        local: boolean,
        mobile: boolean,
        tollFree: boolean
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

    matches = [{id: 0, title: 'Any part of number'}];

    title = ['Number', 'Location', 'Monthly', 'Buy'];

    @ViewChild('row') row: ElementRef;
    @ViewChild('table') table: ElementRef;

    @ViewChild('myNumberOnly') numberInput: ElementRef;

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
        let specialKeys: Array<string>;
        specialKeys = [ 'Backspace', 'Tab', 'End', 'Home'];
        if (specialKeys.indexOf(event.key) !== -1) {
            return;
        }

        let current: string;
        current = this.numberInput.nativeElement.value;
        if (document.activeElement.name === this.numberInput.nativeElement.name) {
            let next: string;
            next = current.concat(event.key);
            if (next && !String(next).match(new RegExp(/^-?[0-9]+(\.[0-9]*){0,1}$/g))) {
                event.preventDefault();
            }
        }
    }

    constructor(private _services: PhoneNumberService,
                private refs: RefsServices) {
        this.pagination = {page: 1, total: 1};
    }

    selectCountry(country: CountryModel) {
        this.selectedCountry = country;
        this.requestDetails.countryCode = country.code;
        this.getList();
    }

    getList(): void {
        this.loading += 1;
        this._services.getAvailableNumbersList(this.requestDetails)
            .then(res => {
                this.requestDetails.limit = res['numbers'].length;
                let remainder = (res['numbers'].length % 2);
                let part1 = this.requestDetails.limit / 2;
                if (remainder > 0) {
                    part1 = part1 + remainder;
                }
                this.list = [res['numbers'].slice(0, part1), res['numbers'].slice(part1)];
                this.pagination.total = 1;
                this.loading -= 1;
            });
    }

    searchInit() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.pagination.page = this.requestDetails.page = 1;
            this.getList();
            clearTimeout(this.searchTimeout);
        }, 500);
    }

    onPageChange(page: number): void {
        this.pagination.page = this.requestDetails.page = page;
        this.getList();
    }

    buyItem(number): void {
        this.selected = number;
        this.modal.body = `Are you sure you want to buy ${number.fullNumber} number?`;
        this.modal.visible = true;
    }

    modalConfirm = (): void => {
        this.selected.loading = true;
        this._services.buyNumber(this.selected.params).then(() => {
            this.selected.loading = false;
            this.selected.inactive = true;
        }).catch(() => {
            this.selected.loading = false;
        });
    }

    private getCountries(): void {
        this.refs.getCountries().then(res => {
            if (this.countries.length === 0) {
                this.countries = res;
                this.countries.forEach(country => {
                    country.title = country.title + ' (+' + country.phoneCode + ')';
                });
            }
            this.selectedCountry = this.countries.find(country => country.code === 'US');
        }).catch(err => {
            // console.error(err);
            // this.loading = false;
        });
    }

    ngOnInit() {
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

}
