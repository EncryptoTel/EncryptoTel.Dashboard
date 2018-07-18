import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PhoneNumberService} from '../../../services/phone-number.service';
// import {calculateHeight} from '../../../shared/shared.functions';
// import {templateJitUrl} from '@angular/compiler';
import {CountryModel} from '../../../models/country.model';
import {RefsServices} from '../../../services/refs.services';

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

    modal: {
        visible: boolean,
        title: string,
        confirm: { type: string, value: string },
        decline: { type: string, value: string }
    };

    searchTimeout;

    selected;

    countries: CountryModel[] = [];
    selectedCountry: CountryModel;

    matches = [{id: 0, title: 'Any part of number'}];

    title = ['Number', 'Location', 'Monthly', 'Buy'];

    @ViewChild('row') row: ElementRef;
    @ViewChild('table') table: ElementRef;

    constructor(private _services: PhoneNumberService,
                private refs: RefsServices) {
        this.pagination = {page: 1, total: 1};
        this.modal = {
            visible: false,
            title: '',
            confirm: {type: 'success', value: 'Yes'},
            decline: {type: 'error', value: 'No'}
        };
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
                // this.list = [res['items'].slice(0, this.requestDetails.limit / 2), res['items'].slice(this.requestDetails.limit / 2)];
                this.list = [res['numbers'].slice(0, this.requestDetails.limit / 2), res['numbers'].slice(this.requestDetails.limit / 2)];
                // console.log(this.list);
                this.pagination.total = 1; // res.pages;
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
        this.modal.title = number.fullNumber;
        this.modal.visible = true;
        // number.loading = true;
        // this._services.buyNumber(number.params)
        //   .then(() => {
        //     number.loading = false;
        //     number.inactive = true;
        //   }).catch();
    }

    modalConfirm = (): void => {
        this.selected.loading = true;
        this._services.buyNumber(this.selected.params)
            .then(() => {
                this.selected.loading = false;
                this.selected.inactive = true;
            }).catch();
        // console.log('Modal confirmed!');
    }
    modalDecline = (): void => {
        // console.log('Modal declined!');
    }

    private getCountries(): void {
        this.refs.getCountries().then(res => {
            // console.log(res);
            this.countries = res;
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
            // limit: calculateHeight(this.table, this.row) * 2
            limit: 40,
            local: true,
            mobile: false,
            tollFree: false
        };
        this.getList();
        this.getCountries();
        this.pagination.page = 1;
    }

}
