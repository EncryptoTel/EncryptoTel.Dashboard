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
import {classToPlain} from '../../../node_modules/class-transformer';

@Component({
    selector: 'pbx-company',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [CompanyService]
})
export class CompanyComponent implements OnInit {
    company: CompanyModel;
    // uses to store database company data to track changes
    originalCompany: CompanyModel;
    companyForm: FormGroup;
    countries: CountryModel[];
    loading = 0;
    saving = 0;
    selectedCountry: CountryModel;
    sidebarInfo: SidebarInfoModel;
    modal: ModalEx;
    editMode: boolean;

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

        this.modal = new ModalEx('Company has been changed. Your data will be lost. Dou you really want to continue?', 'cancelEdit');
        
        this.sidebarInfo = new SidebarInfoModel();
        this.sidebarInfo.loading = 0;
        this.sidebarInfo.title = 'Information';
        this.sidebarInfo.position = '';
        this.sidebarInfo.items.push(new SidebarInfoItem(0, 'External numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(1, 'Internal numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(2, 'Storage space', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(3, 'Available space', null));

        this.initCompanyForm();
    }

    initCompanyForm(): void {
        this.companyForm = this._fb.group({
            name:  ['', [ Validators.required ]],
            email: ['', [ Validators.pattern(emailRegExp) ]],
            phone: [''],
            vatId: [''],
            companyAddress: this._fb.array([
                this._fb.group({
                    id: [null],
                    type: [null],
                    postalCode: [null],
                    regionName: [''],
                    locationName: [''],
                    street: [''],
                    building: [''],
                    office: [''],
                    country: this._fb.group({
                        id: [''],
                        code: [''],
                        title: ['']
                    }),
                })
            ]),
            id: [null]
        });
    }

    decline(): void {
        const currentCompany = JSON.stringify(this.company);
        // console.log('current', currentCompany);
        const formCompany = JSON.stringify(this.companyForm.value);
        // console.log('form', formCompany);

        if (currentCompany !== formCompany) {
            this.modal.visible = true;
        }
        else {
            this.cancel();
        }
    }

    cancel(): void {
        this.service.resetErrors();
        this.companyForm.reset();
        this.selectedCountry = null;
        this.setCompanyFormData();
        this.validate();
        this.editMode = false;
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

    private getCompany(): void {
        this.loading ++;
        this.service.getCompany().then((company: CompanyModel) => {
            this.company = company;
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
        this.sidebarInfo.loading++;
        this._dashboard.getDashboard().then(res => {
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

    edit(): void {
        this.editMode = true;
    }

    ngOnInit() {
        this.getCompany();
        this.getCountries();
        this.getSidebar();
    }
}
