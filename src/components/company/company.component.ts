import { formatNumber } from 'libphonenumber-js';
import { classToPlain } from 'class-transformer';
import { CountryModel } from '../../models/country.model';
import { RefsServices } from '../../services/refs.services';
import { DashboardModel } from '../../models/dashboard.model';
import { CompanyService } from '../../services/company.service';
import {Component, ElementRef, OnInit, ViewChild, ViewChildren} from '@angular/core';
import { MessageServices } from '../../services/message.services';
import { DashboardServices } from '../../services/dashboard.services';
import { CompanyModel, CompanyInfoModel } from '../../models/company.model';
import { SidebarInfoItem, SidebarInfoModel } from '../../models/base.model';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormBaseComponent } from '../../elements/pbx-form-base-component/pbx-form-base-component.component';
import { emailRegExp, companyNameRegExp, nameRegExp, companyVatIDRegExp, companyPhoneRegExp, companyOfficeRegExp, companyHouseRegExp } from '../../shared/vars';

import {ModalEx} from '../../elements/pbx-modal/pbx-modal.component';
import {compareObjects, validateFormControls} from '../../shared/shared.functions';
import {ValidationHost} from '../../models/validation-host.model';


@Component({
    selector: 'pbx-company',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class CompanyComponent extends FormBaseComponent implements OnInit {
    company: CompanyModel;
    companyInfo: CompanyInfoModel;

    countries: CountryModel[];
    selectedCountry: CountryModel;

    sidebarInfo: SidebarInfoModel;
    editMode: boolean;
    logo: string;

    // TODO: временная переменная для отладки/дизайна
    templateView: boolean = false;

    @ViewChildren('label') labelFields;
    @ViewChild('fileInput') fileInput: ElementRef;

    // -- component lifecycle methods -----------------------------------------

    constructor(public service: CompanyService,
                protected _fb: FormBuilder,
                private _dashboard: DashboardServices,
                private _refs: RefsServices,
                private _message: MessageServices) {
        super(_fb);

        this.editMode = false;
        this.countries = [];
        this.logo = './assets/images/avatar/company_details.png';
        this.sidebarInfo = new SidebarInfoModel();
        this.sidebarInfo.loading = 0;
        this.sidebarInfo.title = 'Information';
        this.sidebarInfo.position = '';
        this.sidebarInfo.items.push(new SidebarInfoItem(0, 'External numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(1, 'Internal numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(2, 'Storage space', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(3, 'Available space', null));

        this.companyInfo = this.service.companyInfo;

        this.validationHost.customMessages = [
            { name: 'Organization', error: 'pattern', message: 'Company name may contain letters, digits and dashes only' },
            { name: 'State/Region', error: 'pattern', message: 'State/region may contain letters, digits and dashes only' },
            { name: 'City', error: 'pattern', message: 'City may contain letters, digits and dashes only' },
            { name: 'Street', error: 'pattern', message: 'Street may contain letters, digits and dashes only' },
            { name: 'House', error: 'pattern', message: 'House number may contain letters, digits and slashes only' },
            { name: 'Office', error: 'pattern', message: 'Office may contain digits only' },
            { name: 'Postal code', error: 'pattern', message: 'Postal code may contain letters and digits only' },
            { name: 'Email', error: 'pattern', message: 'Please enter valid email address' },
            { name: 'Phone', error: 'pattern', message: 'Phone number may contain digits only' },
            { name: 'VAT ID', error: 'pattern', message: 'VAT ID may contain digits and letters only' },
        ];
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getCompany();
        this.getCountries();
        this.getSidebar();
    }

    // -- form processing methods ---------------------------------------------

    initForm(): void {
        this.form = this._fb.group({
            logo: [this.logo],
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

    get addressControls(): FormArray {
        return this.form.get('companyAddress') as FormArray;
    }

    isFormEmpty(formGroup: any): boolean {
        let count: number;
        count = this.countFormNonEmptyFields(formGroup);
        return count === 0;
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

    setCompanyFormData() {
        if (this.company.name) {
            let company: object;
            company = classToPlain(this.company);
            this.form.patchValue(company);
            if (this.company.companyAddress && this.company.companyAddress.length) {
                this.selectedCountry = this.company.companyAddress[0].country;
            }
            this.saveFormState();
        }
    }

    // -- event handlers ------------------------------------------------------

    edit(): void {
        this.editMode = true;
    }

    decline(): void {
        super.close(this.company.isValid, () => this.cancel());
    }

    cancel(): void {
        this.service.resetErrors();
        this.form.reset();
        this.selectedCountry = null;
        this.setCompanyFormData();
        this.validateForms();
        if (this.company.id) {
            this.editMode = false;
        }
    }

    save(): void {
        let formValid: boolean;
        formValid = this.validateForms();
        if (formValid) {
            this.locker.lock();
            this.service.save({...this.form.value}, false).then((company) => {
                this._message.writeSuccess('Company successfully updated.');
                this.editMode = false;
                this.companyInfo.logo = company.logo;
            }).catch(error => {
                // this._message.writeError('Company update error.');
                console.log('Company update error', error);
            }).then(() => this.locker.unlock());
        } else {
            this.form.markAsTouched();
        }
    }

    selectCountry(country: CountryModel): void {
        this.selectedCountry = country;
        this.form.get(['companyAddress']).get('0').get('country').setValue(country);
    }

    // -- helpers methods -----------------------------------------------------

    formatPhone(event): void {
        event.target.value = formatNumber(event.target.value, 'International');
    }

    setCompanyInfo(dashboard: DashboardModel): void {
        this.service.companyInfo.setSectionData('Information', dashboard);
        this.service.companyInfo.setSectionData('Extensions', dashboard);
        this.service.companyInfo.setSectionData('IVR', dashboard);
        this.service.companyInfo.setSectionData('CDR', dashboard);
        this.service.companyInfo.setSectionData('Tariff Plan', dashboard);
        this.service.companyInfo.setSectionData('Invoices', dashboard);
        this.service.companyInfo.setPhoneNumbersData('Phone numbers', dashboard);
    }

    // -- data retrieval methods ----------------------------------------------

    private getCompany(): void {
        this.locker.lock();
        this.service.getCompany().then((company: CompanyModel) => {
            this.company = company;
            this.companyInfo.logo = company.logo;
            this.logo = company.logo;
            this.setCompanyFormData();

            this.editMode = !company.isValid;
        }).catch(() => {})
          .then(() => this.locker.unlock());
    }

    private getCountries() {
        this.locker.lock();
        this._refs.getCountries().then(res => {
            this.countries = res;
        }).catch(() => {})
          .then(() => this.locker.unlock());
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
        }).catch(() => {})
          .then(() => this.sidebarInfo.loading --);
    }


    dropHandler(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        this.uploadFiles(files[0]);
    }

    dragOverHandler(event): void {
        event.preventDefault();
    }

    dragEndHandler(event): void {}

    dragLeaveHandler(event): void {
        event.preventDefault();
    }

    private uploadFiles(file) {
        console.log(file);
        this.service.uploadFile(file, null, null).then(response => {
            if (response.logo) {
                this.logo = response.url;
                this.company.logo = response.logo;
                this.form.patchValue(this.company);
            }
        }).catch(() => {
        });
    }

    sendFile(event) {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            this.uploadFiles(file);
        }
    }

    selectFile() {
        this.fileInput.nativeElement.click();
    }
}
