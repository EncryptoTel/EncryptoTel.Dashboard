import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {formatNumber} from 'libphonenumber-js';
import {CompanyService} from '../../services/company.service';
import {CompanyModel} from '../../models/company.model';
import {emailRegExp} from '../../shared/vars';
import {DashboardServices} from '../../services/dashboard.services';
import {RefsServices} from '../../services/refs.services';
import {CountryModel} from '../../models/country.model';
import {MessageServices} from "../../services/message.services";
import {SidebarInfoItem, SidebarInfoModel} from "../../models/base.model";
import {ModalEx} from "../../elements/pbx-modal/pbx-modal.component";

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
    sidebarInfo: SidebarInfoModel = new SidebarInfoModel();
    modal = new ModalEx('', 'cancelEdit');

    @ViewChildren('label') labelFields;

    constructor(public service: CompanyService,
                private fb: FormBuilder,
                private dashboard: DashboardServices,
                private refs: RefsServices,
                private message: MessageServices) {

        this.sidebarInfo.loading = 0;
        this.sidebarInfo.title = 'Information';
        this.sidebarInfo.position = '';
        this.sidebarInfo.items.push(new SidebarInfoItem(0, 'External numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(1, 'Internal numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(2, 'Storage space', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(3, 'Available space', null));

        this.companyForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.pattern(emailRegExp)]],
            phone: [''],
            vatId: [''],
            companyAddress: this.fb.array([
                this.fb.group({
                    country: [''],
                    postalCode: [''],
                    regionName: [''],
                    locationName: [''],
                    street: [''],
                    building: [''],
                    office: ['']
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
            this.service.save({...this.companyForm.value}, false).then(() => {
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
        if (this.company.name) {
            let company = {};
            if (this.company.name) {
                company['name'] = this.company.name;
            }
            if (this.company.email) {
                company['email'] = this.company.email;
            }
            if (this.company.phone) {
                company['phone'] = formatNumber(`+${this.company.phone}`, 'International');
            }
            if (this.company.vatId) {
                company['vatId'] = this.company.vatId;
            }
            if (this.company.companyAddress) {
                company['companyAddress'] = [{
                    postalCode: this.company.companyAddress[0].postalCode,
                    regionName: this.company.companyAddress[0].regionName,
                    locationName: this.company.companyAddress[0].locationName,
                    street: this.company.companyAddress[0].street,
                    building: this.company.companyAddress[0].building,
                    office: this.company.companyAddress[0].office,
                }];
            };

            this.companyForm.patchValue(company);
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
            for (let i = 0; i < this.sidebarInfo.items.length; i++) {
                const item = this.sidebarInfo.items[i];
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
