import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {formatNumber} from 'libphonenumber-js';
import {SidebarInfo} from '../../models/sidebar-info.model';
import {CompanyServices} from '../../services/company.services';
import {CompanyModel, CountriesModel, CountryModel} from '../../models/company.model';
import {emailRegExp} from '../../shared/vars';

@Component({
    selector: 'pbx-company',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [CompanyServices]
})

export class CompanyComponent implements OnInit {
    company: CompanyModel;
    companyForm: FormGroup;
    countries: CountryModel[] = [];
    hightLightLabelSelect = false;
    loading = true;
    selectedCountry: CountryModel;
    sidebarInfo: SidebarInfo;

    @ViewChildren('label') labelFields;

    constructor(private _services: CompanyServices,
                private fb: FormBuilder) {
        this.sidebarInfo = {
            title: 'Information',
            description: [
                {title: 'External numbers', value: 4},
                {title: 'Internal numbers', value: 5},
                {title: 'Unassigned Ext', value: 7},
                {title: 'Storage space', value: '1500 Mb'},
                {title: 'Available space', value: '430 Mb'},
            ]
        };

        this.companyForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.pattern(emailRegExp)]],
            phone: ['', [Validators.required]],
            vatId: ['', [Validators.required]],
            companyAddress: this.fb.array([
                this.fb.group({
                    country: ['', [Validators.required]],
                    postalCode: ['', [Validators.required]],
                    regionName: ['', [Validators.required]],
                    locationName: ['', [Validators.required]],
                    street: ['', [Validators.required]],
                    building: ['', [Validators.required]],
                    office: ['', [Validators.required]]
                })
            ])
        });
    }

    cancel(): void {
        this.companyForm.reset();
        this.selectedCountry = null;
        this.fillCompany();
        this.validate();
    }

    formatPhone(event): void {
        event.target.value = formatNumber(event.target.value, 'International');
        this.toggleHighlightLabel(event);
    }

    test() {
        console.log('work');
    }

    toggleHighlightLabel(event): void {
        event.target.labels[0].classList.toggle('active');
    }

    save(): void {
        this.validate();
        if (this.companyForm.valid) {
            this.loading = true;
            this._services.save({...this.companyForm.value}).then(() => {
                this.loading = false;
            }).catch(err => {
                console.error(err);
                this.loading = false;
            });
        } else {
            this.companyForm.markAsTouched();
        }
    }

    selectCountry(country: CountryModel): void {
        this.selectedCountry = country;
        this.companyForm.get(['companyAddress']).get('0').get('country').setValue(country.id);
    }

    private fillCompany() {
        if (this.company.name && this.company.phone && this.company.phone) {
            const company = {
                name: this.company.name,
                email: this.company.email,
                phone: formatNumber(`+${this.company.phone}`, 'International'),
                vatId: this.company.vatId,
                companyAddress: [{
                    country: this.company.companyAddress[0].country.id,
                    postalCode: this.company.companyAddress[0].postalCode,
                    regionName: this.company.companyAddress[0].regionName,
                    locationName: this.company.companyAddress[0].locationName,
                    street: this.company.companyAddress[0].street,
                    building: this.company.companyAddress[0].building,
                    office: this.company.companyAddress[0].office,
                }]
            };
            this.companyForm.setValue(company);
            this.selectedCountry = this.company.companyAddress[0].country;
        }
    }

    private getCompany(): void {
        this._services.getCompany().then((res: CompanyModel) => {
            this.company = res;
            this.fillCompany();
            this.loading = false;
        }).catch(err => {
            console.error(err);
            this.loading = false;
        });
    }

    private getCountries(): void {
        this._services.getCountries().then((res: CountriesModel) => {
            this.countries = res.countries;
            this.getCompany();
        }).catch(err => {
            console.error(err);
            this.loading = false;
        });
    }

    private validate() {
        this.companyForm.updateValueAndValidity();
        Object.keys(this.companyForm.controls).forEach(field => {
            const control = this.companyForm.get(field);
            control.markAsTouched();
        });
        const address = this.companyForm.get(['companyAddress', '0']) as FormGroup;
        Object.keys(address.controls).forEach(field => {
            const control = address.get(field);
            control.markAsTouched();
        });
    }

    ngOnInit(): void {
        this.getCountries();
    }
}
