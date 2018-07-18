import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {formatNumber} from 'libphonenumber-js';
import {SidebarInfo} from '../../models/sidebar-info.model';
import {CompanyServices} from '../../services/company.services';
import {CompanyModel, CountriesModel, CountryModel} from '../../models/company.model';
import {emailRegExp} from '../../shared/vars';
import {DashboardServices} from "../../services/dashboard.services";

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
                private fb: FormBuilder,
                private dashboard: DashboardServices) {
        this.sidebarInfo = {
            loading: 0,
            title: 'Information',
            description: [
                {title: 'External numbers', value: null},
                {title: 'Internal numbers', value: null},
                // {title: 'Unassigned Ext', value: null},
                {title: 'Storage space', value: null},
                {title: 'Available space', value: null},
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

    updateSidebar() {
        this.sidebarInfo.loading++;
        this.dashboard.getDashboard().then(res => {
            for (let i = 0; i < this.sidebarInfo.description.length; i++) {
                let item = this.sidebarInfo.description[i];
                switch (item.title) {
                    case 'External numbers':
                        item.value = res.outersCount;
                        break;
                    case 'Internal numbers':
                        item.value = res.innersCount;
                        break;
                    case 'Unassigned Ext':
                        item.value = null;
                        break;
                    case 'Storage space':
                        item.value = `${res.storage.totalSize} ${res.storage.measure}`;
                        break;
                    case 'Available space':
                        item.value = `${res.storage.availableSize} ${res.storage.measure}`;
                        break;
                }
            }
            this.sidebarInfo.loading--;
        }).catch(res => {
            this.sidebarInfo.loading--;
        });
    }

    ngOnInit(): void {

        this.getCountries();
        this.updateSidebar();
    }
}
