import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PhoneNumbersServices} from '../../../services/phone-numbers.services';
import {calculateHeight} from '../../../shared/shared.functions';
import {templateJitUrl} from "@angular/compiler";
import {CountryModel} from "../../../models/country.model";
import {CountryServices} from "../../../services/country.services";

@Component({
    selector: 'buy-phone-numbers-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PhoneNumbersServices, CountryServices]
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

    modal: {
        visible: boolean,
        title: string,
        confirm: { type: string, value: string },
        decline: { type: string, value: string }
    };

    searchTimeout;

    selected;

    countries: CountryModel[] = [];
    hightLightLabelSelect = false;

    @ViewChild('row') row: ElementRef;
    @ViewChild('table') table: ElementRef;

    constructor(private _services: PhoneNumbersServices,
                private _countries: CountryServices) {
        this.pagination = {page: 1, total: 1};
        this.modal = {
            visible: false,
            title: '',
            confirm: {type: 'success', value: 'Yes'},
            decline: {type: 'error', value: 'No'}
        };
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
        this._countries.getCountries().then(res => {
            // console.log(res);
            this.countries = res;
        }).catch(err => {
            console.error(err);
            this.loading = false;
        });
    }

    ngOnInit() {
        this.requestDetails = {
            countryCode: 'US',
            search: '',
            page: 1,
            //limit: calculateHeight(this.table, this.row) * 2
            limit: 40
        };
        this.getList();
        this.getCountries();
        this.pagination.page = 1;
    }

}
