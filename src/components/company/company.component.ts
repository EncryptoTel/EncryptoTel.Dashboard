import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {formatNumber} from 'libphonenumber-js';
import {SidebarInfo} from '../../models/sidebar-info.model';
import {CompanyService} from '../../services/company.service';
import {CompanyModel} from '../../models/company.model';
import {emailRegExp} from '../../shared/vars';
import {DashboardServices} from '../../services/dashboard.services';
import {RefsServices} from '../../services/refs.services';
import {CountryModel} from '../../models/country.model';
import {MessageServices} from "../../services/message.services";

@Component({
    selector: 'pbx-company',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [CompanyService]
})

export class CompanyComponent implements OnInit {
    company: CompanyModel;
    companyForm: FormGroup;
    countries: CountryModel[] = [];
    loading = 0;
    saving = 0;
    selectedCountry: CountryModel;
    sidebarInfo: SidebarInfo;
    modal = {
        visible: false,
        confirm: {type: 'success', value: 'Yes'},
        decline: {type: 'cancel', value: 'Stay'}
    };

  @ViewChildren('label') labelFields;

    constructor(public service: CompanyService,
                private fb: FormBuilder,
                private dashboard: DashboardServices,
                private refs: RefsServices,
                private message: MessageServices) {

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
        this.service.resetErrors();
        this.companyForm.reset();
        this.selectedCountry = null;
        this.fillCompany();
        this.validate();
    }

    formatPhone(event): void {
        event.target.value = formatNumber(event.target.value, 'International');
    }

    save(): void {
        this.validate();
        if (this.companyForm.valid) {
            this.saving++;
            this.service.save({...this.companyForm.value}).then(() => {
                this.message.writeSuccess('Company successfully updated.');
                this.saving--;
            }).catch(() => {
                this.saving--;
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

    get addressControls(): FormArray {
        return this.companyForm.get('companyAddress') as FormArray;
    }

    private getCompany() {
        this.loading++;
        this.service.getCompany().then((res: CompanyModel) => {
            this.company = res;
            this.fillCompany();
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }

    private getCountries() {
        this.loading++;
        this.refs.getCountries().then(res => {
            this.countries = res;
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }

    private getSidebar() {
        this.sidebarInfo.loading++;
        this.dashboard.getDashboard().then(res => {
            for (let i = 0; i < this.sidebarInfo.description.length; i++) {
                const item = this.sidebarInfo.description[i];
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
        }).catch(() => {
            this.sidebarInfo.loading--;
        });
    }

    ngOnInit() {
        this.getCompany();
        this.getCountries();
        this.getSidebar();
    }
}
