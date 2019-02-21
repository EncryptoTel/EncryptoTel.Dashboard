import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { formatNumber } from 'libphonenumber-js';

import { CountryModel } from '@models/country.model';
import { DashboardModel } from '@models/dashboard.model';
import { CompanyModel, CompanyInfoModel } from '@models/company.model';
import { SidebarInfoItem, SidebarInfoModel } from '@models/base.model';
import { RefsServices } from '@services/refs.services';
import { CompanyService } from '@services/company.service';
import { MessageServices } from '@services/message.services';
import { DashboardServices } from '@services/dashboard.services';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { emailRegExp, companyNameRegExp, nameRegExp, companyVatIDRegExp, companyPhoneRegExp, companyOfficeRegExp, companyHouseRegExp } from '../../shared/vars';
import { isDevEnv } from '@shared/shared.functions';
import { companyCountryValidator } from '@shared/encry-form-validators';
import { TranslateService } from '@ngx-translate/core';


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
            { key: 'name', error: 'required', message: this.translate.instant('Please enter the organization name') },
            { key: 'name', error: 'maxLength', message: this.translate.instant('Organization name can\'t contain over 100 characters') },
            { key: 'name', error: 'pattern', message: this.translate.instant('Organization name contains invalid characters. You can only use letters, numbers and a dash') },
            { key: 'companyAddress.*.country', error: 'required', message: this.translate.instant('Please choose the country') },
            { key: 'companyAddress.*.regionName', error: 'pattern', message: this.translate.instant('State/region contains invalid characters. You can only use letters, numbers and a dash') },
            { key: 'companyAddress.*.locationName', error: 'pattern', message: this.translate.instant('City contains invalid characters. You can only use letters, numbers and a dash') },
            { key: 'companyAddress.*.street', error: 'required', message: this.translate.instant('Please enter the Street') },
            { key: 'companyAddress.*.street', error: 'pattern', message: this.translate.instant('Street contains invalid characters. You can only use letters, numbers and a dash') },
            { key: 'companyAddress.*.building', error: 'required', message: this.translate.instant('Please enter the House number') },
            { key: 'companyAddress.*.building', error: 'pattern', message: this.translate.instant('House number contains invalid characters. You can only use letters, numbers and a slash') },
            { key: 'companyAddress.*.office', error: 'pattern', message: this.translate.instant('Office contains invalid characters. You can use numbers only') },
            { key: 'companyAddress.*.postalCode', error: 'minlength', message: this.translate.instant('Postal code is too short. Please use at least 6 characters') },
            { key: 'companyAddress.*.postalCode', error: 'pattern', message: this.translate.instant('Postal code contains invalid characters. You can only use letters and numbers') },
            { key: 'email', error: 'pattern', message: this.translate.instant('Please enter correct email address') },
            { key: 'phone', error: 'minlength', message: this.translate.instant('Contact phone is too short. Please use at least 6 characters') },
            { key: 'phone', error: 'pattern', message: this.translate.instant('Contact phone contains invalid characters. You can use numbers only') },
            { key: 'vatId', error: 'minlength', message: this.translate.instant('VAT ID is too short. Please use at least 6 characters') },
            { key: 'vatId', error: 'maxlength', message: this.translate.instant('VAT ID can\'t contain over of 99 characters') },
            { key: 'vatId', error: 'pattern', message: this.translate.instant('VAT ID contains invalid characters. You can use letters, numbers and the following characters: -_') },
        ];

        this._compatibleMediaTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
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
            this.setFormData(this.company);
        }
        else {
          this.form.reset();
          this.getCompany();
        }
    }

    save(): void {
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
        this.service.companyInfo.sectionGroups[1].sections[0].items[0].title = dashboard.cdrDetail.calls.time;
        this.service.companyInfo.sectionGroups[1].sections[0].items[0].value = dashboard.cdrDetail.calls.sum;

        let cdrIncomingCount = '-';
        let cdrOutgoingCount = '-';
        let cdrMissedCount = '-';
        let cdrNoAnswerCount = '-';
        if (dashboard.cdrDetail.tags.length) {
          cdrIncomingCount = dashboard.cdrDetail.tags['incoming'].count || '-';
          cdrOutgoingCount = dashboard.cdrDetail.tags['outgoing'].count || '-';
          cdrMissedCount = dashboard.cdrDetail.tags['missed'].count || '-';
          cdrNoAnswerCount = dashboard.cdrDetail.tags['no-answer'].count || '-';
        }
        this.service.companyInfo.sectionGroups[1].sections[0].items[1].value = cdrIncomingCount;
        this.service.companyInfo.sectionGroups[1].sections[0].items[2].value = cdrOutgoingCount;
        this.service.companyInfo.sectionGroups[1].sections[0].items[3].value = cdrMissedCount;
        this.service.companyInfo.sectionGroups[1].sections[0].items[4].value = cdrNoAnswerCount;

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
            .catch(() => {})
            .then(() => {
                if (!this.company.isValid) {
                    this.isNewCompany = true;
                    this.editMode = true;
                }
                this.setFormData(this.company);
                this.locker.unlock();
            });
    }

    getCountries() {
        this.locker.lock();

        this.refs.getCountries()
            .then(res => {
                this.countries = res;
            })
            .catch(() => { })
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
            .catch(() => { })
            .then(() => this.sidebarInfo.loading--);
    }

    saveCompany(): void {
        this.locker.lock();

        this.service.save({ ...this.form.value }, false)
            .then(() => {
                const okMessage = this.company.id
                    ? this.translate.instant('The changes have been saved successfully')
                    : this.translate.instant('Company has been created successfully');
                this.message.writeSuccess(okMessage);
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
            this.message.writeError(this.translate.instant('Accepted formats: jpg, jpeg, png, gif'));
            this.sidebarActive = false;
        }

    }

}
