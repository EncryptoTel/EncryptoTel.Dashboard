import {Component, ElementRef, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, Validators} from '@angular/forms';
import {formatNumber} from 'libphonenumber-js';

import {CountryModel} from '@models/country.model';
import {DashboardModel} from '@models/dashboard.model';
import {CompanyModel, CompanyInfoModel} from '@models/company.model';
import {SidebarInfoItem, SidebarInfoModel} from '@models/base.model';
import {RefsServices} from '@services/refs.services';
import {CompanyService} from '@services/company.service';
import {MessageServices} from '@services/message.services';
import {DashboardServices} from '@services/dashboard.services';
import {FormBaseComponent} from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import {emailRegExp, companyNameRegExp, nameRegExp, companyVatIDRegExp, companyPhoneRegExp, companyOfficeRegExp, companyHouseRegExp} from '../../shared/vars';
import {isDevEnv} from '@shared/shared.functions';
import {companyCountryValidator} from '@shared/encry-form-validators';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-company',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class CompanyComponent extends FormBaseComponent implements OnInit {

    company: CompanyModel = new CompanyModel();
    companyInfo: CompanyInfoModel;
    isNewCompany: boolean = false;

    public sidebarActive: boolean;

    countries: CountryModel[] = [];
    selectedCountry: CountryModel;

    sidebarInfo: SidebarInfoModel;
    editMode: boolean = false;

    // TODO: временная переменная для отладки/дизайна
    templateView: boolean = false;

    @ViewChildren('label') labelFields;
    @ViewChild('fileInput') fileInput: ElementRef;

    private _compatibleMediaTypes: string[];

    // -- component lifecycle methods -----------------------------------------

    constructor(
        public service: CompanyService,
        protected fb: FormBuilder,
        private dashboard: DashboardServices,
        private refs: RefsServices,
        protected message: MessageServices,
        public translate: TranslateService
    ) {
        super(fb, message, translate);

        this.company.logo = '/assets/icons/_middle/camera.png';
        this.companyInfo = this.service.companyInfo;
        this.companyInfo.logo = this.company.logo;

        this.sidebarInfo = new SidebarInfoModel();
        this.sidebarInfo.loading = 0;
        this.sidebarInfo.title = 'Information';
        this.sidebarInfo.position = '';
        this.sidebarInfo.items.push(new SidebarInfoItem(0, 'External numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(1, 'Internal numbers', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(2, 'Storage space', null));
        this.sidebarInfo.items.push(new SidebarInfoItem(3, 'Available space', null));

        this.validationHost.customMessages = [
            { key: 'name', error: 'pattern', message: this.translate.instant('Company name may contain letters, digits and dashes only') },
            { key: 'companyAddress.*.regionName', error: 'pattern', message: this.translate.instant('State/region may contain letters, digits and dashes only') },
            { key: 'companyAddress.*.locationName', error: 'pattern', message: this.translate.instant('City may contain letters, digits and dashes only') },
            { key: 'companyAddress.*.street', error: 'pattern', message: this.translate.instant('Street may contain letters, digits and dashes only') },
            { key: 'companyAddress.*.building', error: 'pattern', message: this.translate.instant('House number may contain letters, digits and slashes only') },
            { key: 'companyAddress.*.office', error: 'pattern', message: this.translate.instant('Office may contain digits only') },
            { key: 'companyAddress.*.postalCode', error: 'pattern', message: this.translate.instant('Postal code may contain letters and digits only') },
            { key: 'email', error: 'pattern', message: this.translate.instant('Please enter valid email address') },
            { key: 'phone', error: 'pattern', message: this.translate.instant('Phone number may contain digits only') },
            { key: 'vatId', error: 'pattern', message: this.translate.instant('VAT ID contains invalid characters. You can use letters, numbers and the following characters: -_') },
        ];

        this._compatibleMediaTypes = [ 'image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    }

    checkCompatibleType(file: any): boolean {
        return this._compatibleMediaTypes.includes(file.type);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.getCompany();
        this.getCountries();
        this.getSidebar();
    }

    // -- form processing methods ---------------------------------------------
    
    get modelEdit(): boolean {
        return this.company && this.company.isValid;
    }

    initForm(): void {
        this.form = this.fb.group({
            id: [null],
            logo: [''],
            name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(companyNameRegExp)]],
            companyAddress: this.fb.array([
                this.fb.group({
                    id: [null],
                    country: this.fb.group({
                        id: [null],
                        code: [''],
                        title: [''],
                        phoneCode: ['']
                    }, { validator: companyCountryValidator }),
                    regionName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100), Validators.pattern(companyNameRegExp)]],
                    locationName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100), Validators.pattern(companyNameRegExp)]],
                    street: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(companyNameRegExp)]],
                    building: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(companyHouseRegExp)]],
                    office: ['', [Validators.maxLength(15), Validators.pattern(companyOfficeRegExp)]],
                    postalCode: ['', [Validators.minLength(6), Validators.maxLength(9), Validators.pattern(nameRegExp)]],
                    type: [''],
                })
            ]),
            email: ['', [Validators.pattern(emailRegExp)]],
            phone: ['', [Validators.minLength(6), Validators.maxLength(16), Validators.pattern(companyPhoneRegExp)]],
            vatId: [null, [Validators.minLength(6), Validators.maxLength(99), Validators.pattern(companyVatIDRegExp)]],
            // companyDetailFieldValue: this._fb.array([]),
        });
    }

    get addressControls(): FormArray {
        return this.form.get('companyAddress') as FormArray;
    }

    // -- event handlers ------------------------------------------------------

    edit(): void {
        this.setFormData(this.company);
        this.editMode = true;
    }

    decline(): void {
        this.close(() => this.cancel());
    }

    cancel(): void {
        this.service.resetErrors();
        this.selectedCountry = null;

        if (this.company.id) {
            this.editMode = false;
        }
        else {
            this.getCompany();
        }
    }

    save(): void {
        console.log('form', this.form);
        if (this.validateForms()) {
            this.setModelData(this.company);
            this.saveCompany();
        }
        else {
            this.scrollToFirstError();
        }
    }

    selectCountry(country: CountryModel): void {
        this.selectedCountry = country;
        this.form.get(['companyAddress']).get('0').get('country').setValue(country);
    }

    dropHandler(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        this.uploadFiles(files[0]);
    }

    dragOverHandler(event): void {
        this.sidebarActive = true;
        event.preventDefault();
    }

    dragEndHandler(event): void {
    }

    dragLeaveHandler(event): void {
        this.sidebarActive = false;
        event.preventDefault();
    }

    sendFile(event: Event): void {
        event.preventDefault();
        const file = (<HTMLInputElement>event.target).files[0];
        if (file) {
            this.uploadFiles(file);
        }
    }

    selectFile(): void {
        this.fileInput.nativeElement.click();
    }

    // -- common methods -----------------------------------------------------

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

    getCompany(): void {
        this.locker.lock();

        this.service.getCompany()
            .then((company: CompanyModel) => {
                this.company = company;
                this.companyInfo.logo = company.logo;
                this.company.logo = company.logo;
            })
            .catch(() => {
                if (isDevEnv() && this.service.model) {
                    this.company = this.service.model;
                }
            })
            .then(() => {
                this.setFormData(this.company);
                if (!this.company.isValid) {
                    this.isNewCompany = true;
                    this.editMode = true;
                }
                this.locker.unlock();
            });
    }

    getCountries() {
        this.locker.lock();

        this.refs.getCountries()
            .then(res => {
                this.countries = res;
            })
            .catch(() => {})
            .then(() => this.locker.unlock());
    }

    getSidebar() {
        this.sidebarInfo.loading++;

        this.dashboard.getDashboard()
            .then(response => {
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
            })
            .catch(() => {})
            .then(() => this.sidebarInfo.loading--);
    }

    saveCompany(): void {
        this.locker.lock();

        this.service.save({...this.form.value}, false)
            .then(() => {
                this.message.writeSuccess('Company has been successfully updated');
                if (this.isNewCompany) {
                    this.editMode = false;
                    this.isNewCompany = false;
                }
                this.getCompany();
            })
            .catch(error => {
                console.error('Company update error', error);
                if (isDevEnv()) this.getCompany();
            })
            .then(() => this.locker.unlock());
    }

    uploadFiles(file: File): void {
        if (this.checkCompatibleType(file)) {
            this.service.uploadFile(file, null, null).then(response => {
                if (response.logo) {
                    this.company.logo = response.logo;
                    this.setFormData(this.company);
                    this.company.logo = response.url;
                    this.sidebarActive = false;
                    this.form.get('logo').setValue(response.url);
                }
            }).catch(() => {
                this.sidebarActive = false;
            });
        } else {
            this.message.writeError('Accepted formats: jpg, jpeg, png, gif');
            this.sidebarActive = false;
        }

    }

}
