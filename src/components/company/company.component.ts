import {Component, OnInit, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import {CompanyService} from '../../services/company.service';
import {DashboardServices} from '../../services/dashboard.services';
import {RefsServices} from '../../services/refs.services';
import {MessageServices} from "../../services/message.services";

import {CompanyModel, CompanyInfoModel} from '../../models/company.model';
import {CountryModel} from '../../models/country.model';
import {SidebarInfoItem, SidebarInfoModel} from "../../models/base.model";
import {DashboardModel} from '../../models/dashboard.model';

import {formatNumber} from 'libphonenumber-js';
import {emailRegExp, companyNameRegExp, nameRegExp, companyVatIDRegExp, companyPhoneRegExp, companyOfficeRegExp, companyHouseRegExp} from '../../shared/vars';
import {ModalEx} from "../../elements/pbx-modal/pbx-modal.component";
import {classToPlain} from '../../../node_modules/class-transformer';
import {compareObjects} from '../../shared/shared.functions';
import {ValidationHost} from '../../models/validation-host.model';


@Component({
    selector: 'pbx-company',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class CompanyComponent implements OnInit {
    company: CompanyModel;
    // uses to store database company data to track changes
    originalCompany: CompanyModel;
    companyForm: FormGroup;
    companyInfo: CompanyInfoModel;
    countries: CountryModel[];
    loading = 0;
    saving = 0;
    selectedCountry: CountryModel;
    sidebarInfo: SidebarInfoModel;
    modal: ModalEx;
    editMode: boolean;

    validationHost: ValidationHost;

    // TODO: временная переменная для отладки/дизайна
    templateView: boolean = false;

    @ViewChildren('label') labelFields;

    constructor(public service: CompanyService,
                private _fb: FormBuilder,
                private _dashboard: DashboardServices,
                private _refs: RefsServices,
                private _message: MessageServices) {

        this.editMode = false;

        this.countries = [];
        this.loading = 0;
        this.saving = 0;

        this.modal = new ModalEx(`You've made changes. Do you really want to leave without saving?`, 'cancelEdit');
        
        this.sidebarInfo = new SidebarInfoModel();
        this.sidebarInfo.loading = 0;
        this.sidebarInfo.title = 'Information';
        this.sidebarInfo.position = '';
        this.sidebarInfo.items.push(new SidebarInfoItem(0, 'External numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(1, 'Internal numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(2, 'Storage space', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(3, 'Available space', null));

        this.companyInfo = this.service.companyInfo;

        this.initCompanyForm();
        this.validationHost = new ValidationHost(this.companyForm);
        this.validationHost.customMessages = [
            { name: 'Organization', error: 'pattern', message: 'Company name may contain letters, digits and dashes only' },
            { name: 'State/Region', error: 'pattern', message: 'State/region may contain letters, digits and dashes only' },
            { name: 'City', error: 'pattern', message: 'City may contain letters, digits and dashes only' },
            { name: 'Street', error: 'pattern', message: 'Street may contain letters, digits and dashes only' },
            { name: 'House', error: 'pattern', message: 'House number may contain letters, digits and slashes only' },
            { name: 'Office', error: 'pattern', message: 'Office may contain digits only' },
            { name: 'Postal code', error: 'pattern', message: 'Postal code may contain letters and digits only' },
            { name: 'Email', error: 'pattern', message: 'Please enter a valid email address' },
            { name: 'Phone', error: 'pattern', message: 'Phone number may contain digits only' },
            { name: 'VAT ID', error: 'pattern', message: 'VAT ID may contain digits and letters only' },
        ];
        this.validationHost.start();
    }

    initCompanyForm(): void {
        this.companyForm = this._fb.group({
            name:  [null, [ Validators.required, Validators.maxLength(100), Validators.pattern(companyNameRegExp) ]],
            companyAddress: this._fb.array([
                this._fb.group({
                    id: [null],
                    country: this._fb.group({
                        id: [null, [ Validators.required ]],
                        code: [null],
                        title: [null],
                        phoneCode: [null]
                    }),
                    regionName: [null, [ Validators.required, Validators.maxLength(100), Validators.pattern(companyNameRegExp) ]],
                    locationName: [null, [ Validators.required, Validators.maxLength(100), Validators.pattern(companyNameRegExp) ]],
                    street: [null, [ Validators.required, Validators.maxLength(100), Validators.pattern(companyNameRegExp) ]],
                    building: [null, [ Validators.required, Validators.maxLength(10), Validators.pattern(companyHouseRegExp) ]],
                    office: [null, [ Validators.maxLength(15), Validators.pattern(companyOfficeRegExp) ]],
                    postalCode: [null, [ Validators.minLength(6), Validators.maxLength(9), Validators.pattern(nameRegExp) ]],
                    type: [null],
                })
            ]),
            email: [null, [ Validators.pattern(emailRegExp) ]],
            phone: [null, [ Validators.minLength(6), Validators.maxLength(16), Validators.pattern(companyPhoneRegExp) ]],
            vatId: [null, [ Validators.maxLength(99), Validators.pattern(companyVatIDRegExp) ]],
            // companyDetailFieldValue: this._fb.array([]),
            id: [null]
        });
    }

    decline(): void {
        if (compareObjects(this.company, this.companyForm.value)) {
            this.cancel();
        }
        else {
            this.modal.visible = true;
        }
    }
    
    isFormEmpty(formGroup: any): boolean {
        let count = this.countFormNonEmptyFields(formGroup);
        console.log('count', count);
        return count == 0;
    }

    countFormNonEmptyFields(formGroup: any, count: number = 0): number {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
    
            if (control instanceof FormControl) {
                if (control.value) count ++;
            }
            else if (control instanceof FormGroup || control instanceof FormArray) {
                count += this.countFormNonEmptyFields(control, count);
            }
        });
        return count;
    }

    cancel(): void {
        this.service.resetErrors();
        this.companyForm.reset();
        this.selectedCountry = null;
        this.setCompanyFormData();
        this.validate();
        if (this.company.id) {
            this.editMode = false;
        }
    }

    formatPhone(event): void {
        event.target.value = formatNumber(event.target.value, 'International');
    }

    save(): void {
        this.validate();
        if (this.companyForm.valid) {
            this.saving ++;
            this.service.save({...this.companyForm.value}, false).then(() => {
                this._message.writeSuccess('Company successfully updated.');
                this.editMode = false;
                this.saving --;
            }).catch(error => {
                this._message.writeError('Company update error.');
                console.log('Company update error', error);
                this.saving --;
            });
        } else {
            this.companyForm.markAsTouched();
            // this.controller[0].visible = true;
        }
    }

    selectCountry(country: CountryModel): void {
        this.selectedCountry = country;
        this.companyForm.get(['companyAddress']).get('0').get('country').setValue(country);
    }

    setCompanyFormData() {
        if (this.company.name) {
            let company = classToPlain(this.company);
            this.companyForm.patchValue(company);
            if (this.company.companyAddress && this.company.companyAddress.length) {
                this.selectedCountry = this.company.companyAddress[0].country;
            }
        }
    }

    setCompanyInfo(dashboard: DashboardModel): void {
        // console.log('dashboard', dashboard);
        this.service.companyInfo.setSectionData("Information", dashboard);
        this.service.companyInfo.setSectionData("Extensions", dashboard);
        this.service.companyInfo.setSectionData("IVR", dashboard);
        this.service.companyInfo.setSectionData("CDR", dashboard);
        this.service.companyInfo.setSectionData("Tariff Plan", dashboard);
        this.service.companyInfo.setSectionData("Invoices", dashboard);
        this.service.companyInfo.setPhoneNumbersData("Phone numbers", dashboard);
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
        
        this.validationHost.clearControlsFocusedState();
    }

    get addressControls(): FormArray {
        return this.companyForm.get('companyAddress') as FormArray;
    }

    private getCompany(): void {
        this.loading ++;
        this.service.getCompany().then((company: CompanyModel) => {
            this.company = company;
            // console.log('company', company);
            // console.log('companyInfo', this.companyInfo);
            this.originalCompany = company;
            this.setCompanyFormData();

            this.editMode = !company.isValid;
            this.loading --;
        }).catch(() => {
            this.loading --;
        });
    }

    private getCountries() {
        this.loading ++;
        this._refs.getCountries().then(res => {
            this.countries = res;
            this.loading --;
        }).catch(() => {
            this.loading --;
        });
    }

    private getSidebar() {
        this.sidebarInfo.loading ++;
        this._dashboard.getDashboard().then(response => {
            this.setCompanyInfo(response);

            for (let i = 0; i < this.sidebarInfo.items.length; i++) {
                const item = this.sidebarInfo.items[i];
                switch (item.title) {
                    case 'External numbers':
                        item.value = response.outersCount;
                        break;
                    case 'Internal numbers':
                        item.value = response.innersCount;
                        break;
                    case 'Unassigned Ext':
                        item.value = null;
                        break;
                    case 'Storage space':
                        item.value = `${response.storage.totalSize} ${response.storage.measure}`;
                        break;
                    case 'Available space':
                        item.value = `${response.storage.availableSize} ${response.storage.measure}`;
                        break;
                }
            }
            this.sidebarInfo.loading --;
        }).catch(() => {
            this.sidebarInfo.loading --;
        });
    }

    edit(): void {
        this.editMode = true;
    }

    ngOnInit() {
        this.getCompany();
        this.getCountries();
        this.getSidebar();
    }
}
