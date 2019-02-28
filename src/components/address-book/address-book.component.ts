import {EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {AddressBookService} from '@services/address-book.service';
import {
    AddressBookItem,
    AddressBookModel,
    ContactValueModel,
    TypesModel
} from '@models/address-book.model';
import {RefsServices} from '@services/refs.services';
import {FilterItem, PageInfoModel, SidebarButtonItem, SidebarInfoItem, SidebarInfoModel, TableInfoExModel, TableInfoItem} from '@models/base.model';
import {CountryModel} from '@models/country.model';
import {ListComponent} from '@elements/pbx-list/pbx-list.component';
import {MessageServices} from '@services/message.services';
import {ModalEx} from '@elements/pbx-modal/pbx-modal.component';
import {AnimationComponent} from '@shared/shared.functions';
import {emailRegExp, addressPhoneRegExp, adddressNameRegExp, adddressAddressRegExp} from '@shared/vars';
import {FormBaseComponent} from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import {TariffStateService} from '@services/state/tariff.state.service';
import {ScrollEvent} from '@shared/scroll.directive';
import {ContactState} from '@services/state/contact.service';
import {ActivatedRoute, Router, NavigationStart, NavigationEnd} from '@angular/router';


@AnimationComponent({
    selector: 'pbx-address-book',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PageInfoModel],
})
export class AddressBookComponent extends FormBaseComponent implements OnInit {
    addressBookModel: AddressBookModel;
    types: TypesModel;
    countries: CountryModel[];

    selected: AddressBookItem;
    itemsCache: AddressBookItem[];

    addressListHeaders: any;
    @ViewChild(ListComponent) list: ListComponent;

    filters: FilterItem[];
    sidebar: SidebarInfoModel;
    table: TableInfoExModel = new TableInfoExModel();
    modalBlock: ModalEx;
    modalDelete: ModalEx;
    editMode: boolean = false;

    private _forceReload: boolean;

    @Output() onScroll = new EventEmitter<ScrollEvent>();

    // -- properties ----------------------------------------------------------

    get addressForm(): FormGroup {
        return this.form;
    }

    get modelEdit(): boolean {
        return !this.isModelCreated;
    }

    // -- component lifecycle methods -----------------------------------------

    hideField: boolean = false;
    mode: any;

    constructor(
        public service: AddressBookService,
        public refs: RefsServices,
        protected message: MessageServices,
        protected fb: FormBuilder,
        protected state: TariffStateService,
        public translate: TranslateService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {
        super(fb, message, translate);


        this.addressBookModel = new AddressBookModel();
        this.addressListHeaders = {
            titles: [
                this.translate.instant('First Name'),
                this.translate.instant('Last Name'),
                this.translate.instant('Phone Number'),
                this.translate.instant('E-mail'), this.translate.instant('Company Name'),
                this.translate.instant('Country')
            ],
            keys: ['firstname', 'lastname', 'phone', 'email', 'company', 'country.title'],
            hide: [false, false, false, true, true, true]
        };

        this.modalBlock = new ModalEx('', 'block');
        this.modalDelete = new ModalEx('', 'delete');

        this.table.sort.isDown = true;
        this.table.sort.column = 'firstname';
        this.table.items.push(new TableInfoItem(this.translate.instant('First Name'), 'firstname', 'firstname'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Last Name'), 'lastname', 'lastname'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Phone Number'), 'phone', 'phone'));
        this.table.items.push(new TableInfoItem(this.translate.instant('E-mail'), 'email', 'email'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Company Name'), 'company', 'company'));
        this.table.items.push(new TableInfoItem(this.translate.instant('Country'), 'country.title', 'country.title'));

        this.filters = [];
        this.sidebar = new SidebarInfoModel();
        this.sidebar.hideEmpty = true;
        this.itemsCache = [];

        this.validationHost.customMessages = this.validationHost.customMessages = [
            {
                key: 'firstname', error: 'pattern', message: this.translate
                    .instant('First name contains invalid characters. You can use letters, numbers and the following characters: \'-_')
            },
            {
                key: 'lastname', error: 'pattern', message: this.translate
                    .instant('Last name contains invalid characters. You can use letters, numbers and the following characters: \'-_')
            },
            {
                key: 'address', error: 'pattern', message: this.translate
                    .instant('Address contains invalid characters. You can use letters, numbers and the following characters: -_.')
            },
            {key: 'contactPhone.*.value', error: 'pattern', message: this.translate.instant('Phone number contains invalid characters. You can only use numbers and #')},
            {key: 'contactEmail.*.value', error: 'pattern', message: this.translate.instant('Please enter a valid email address')},
        ];
    }

    ngOnInit() {
        super.ngOnInit();
        this.getTypes();
        this.getCountries();

        this.router.events.subscribe(route =>  {
            if (route instanceof NavigationEnd) {
                if (this.router.url === '/cabinet/address-book/create') {
                    this.create();
                }
            }
        });
    }

    // -- initialize section --------------------------------------------------

    initSidebar(): void {
        this.sidebar.mode = 'view';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, 'Edit', 'success'));

        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(4, this.translate.instant('First Name'), this.selected.firstname));
        this.sidebar.items.push(new SidebarInfoItem(5, this.translate.instant('Last Name'), this.selected.lastname));

        let phones: any;
        phones = [];
        this.selected.contactPhone.forEach(item => {
            if (item.value) phones.push(item.value);
        });
        this.sidebar.items.push(new SidebarInfoItem(6, phones.length > 1 ? this.translate.instant('Phone') : this.translate.instant('Phone'), phones));

        let emails: any;
        emails = [];
        this.selected.contactEmail.forEach(item => {
            if (item.value) emails.push(item.value);
        });
        this.sidebar.items.push(new SidebarInfoItem(7, emails.length > 1 ? this.translate.instant('Email') : this.translate.instant('Email'), emails));

        this.sidebar.items.push(new SidebarInfoItem(8, this.translate.instant('Company Name'), this.selected.company));
        this.sidebar.items.push(new SidebarInfoItem(9, this.translate.instant('contactDepartment'), this.selected.department));
        this.sidebar.items.push(new SidebarInfoItem(9, this.translate.instant('Position'), this.selected.position));
        this.sidebar.items.push(new SidebarInfoItem(10, this.translate.instant('Country'), this.selected.countryName));
        this.sidebar.items.push(new SidebarInfoItem(11, this.translate.instant('Address'), this.selected.address));
        this.sidebar.items.push(new SidebarInfoItem(12, this.selected.blacklist ? this.translate.instant('Unblock contact') : this.translate.instant('Block contact'), null, true, false, true));
        this.sidebar.items.push(new SidebarInfoItem(13, this.translate.instant('Delete contact'), null, true, false, true));

        this.sidebar.visible = true;
    }

    // -- form component methods ----------------------------------------------

    get contactPhonesFormArray(): FormArray {
        return this.form.get('contactPhone') as FormArray;
    }

    get contactEmailsFormArray(): FormArray {
        return this.form.get('contactEmail') as FormArray;
    }

    get countryFormControl(): CountryModel {
        return <CountryModel>this.form.get('country').value;
    }

    initForm(): void {
        this.formKey = 'addressForm';

        this.form = this.fb.group({
            id: [null],
            firstname: [null, [Validators.required, Validators.pattern(adddressNameRegExp), Validators.maxLength(190)]],
            lastname: [null, [Validators.pattern(adddressNameRegExp), Validators.maxLength(190)]],
            contactPhone: this.fb.array([]),
            contactEmail: this.fb.array([]),
            company: [null, [Validators.maxLength(190)]],
            department: [null, [Validators.maxLength(190)]],
            position: [null, [Validators.maxLength(190)]],
            address: [null, [Validators.pattern(adddressAddressRegExp), Validators.maxLength(190)]],
            country: this.fb.group({
                code: [null],
                id: [null],
                phoneCode: [null],
                title: [null],
            }),
        });
    }

    createPhoneFormControl(model: ContactValueModel): FormGroup {
        return this.fb.group({
            value: [model ? model.value : null, [Validators.minLength(6), Validators.maxLength(16), Validators.pattern(addressPhoneRegExp)]],
            typeId: [model ? model.typeId : null],
            type: [model ? model.type : null],
        });
    }

    createEmailFormControl(model: ContactValueModel): FormGroup {
        return this.fb.group({
            value: [model ? model.value : null, [Validators.pattern(emailRegExp)]],
            typeId: [model ? model.typeId : null],
            type: [model ? model.type : null],
        });
    }

    clearFormArray(formArray: FormArray): void {
        while (formArray.length !== 0) {
            formArray.removeAt(0);
        }
    }

    // -- event handlers ------------------------------------------------------

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (document.activeElement.getAttribute('id') === 'firstname' || document.activeElement.getAttribute('id') === 'lastname') {
            let specialKeys: Array<string>;
            specialKeys = ['Backspace', 'Tab', 'End', 'Home'];
            if (specialKeys.indexOf(event.key) !== -1) {
                return;
            }
            let current: any;
            current = document.activeElement;
            let next: string;
            next = current.value;
            next = next.concat(event.key);
            if (next && !String(next).match(new RegExp(/^-?[0-9A-Za-zА-Яа-я]+$/g))) {
                event.preventDefault();
            }
        }
    }

    pasteMethod($event: any) {
        if (document.activeElement.getAttribute('id') === 'firstname') {
            this.selected.firstname = $event.clipboardData.getData('Text');
        }
        if (document.activeElement.getAttribute('id') === 'lastname') {
            this.selected.lastname = $event.clipboardData.getData('Text');
        }
    }

    click(item) {
        switch (item.id) {
            case 1:
                this.closePage();
                this.state.change.emit(this.hideField);
                this.router.navigateByUrl('/cabinet/address-book');
                this.list.buttons[0].inactive = false;
                break;
            case 2:
                this.edit(this.selected);
                break;
            case 3:
                this.save();
                break;
            case 12:
                this.block();
                break;
            case 13:
                const deleteAlert: string = this.translate.instant('contactDeleteAlert', {name: this.selected.firstname});
                this.modalDelete.body = deleteAlert;
                this.modalDelete.title = this.translate.instant(this.modalDelete.title);
                this.modalDelete.buttons.forEach(button => {
                    button.value = this.translate.instant(button.value);
                });
                this.modalDelete.show();
                break;
        }
    }

    delete(item: any): void {
        this.showSuccessDeletionMessage(item);

        this.closePage(true);
        this.hideField = false;
        this.state.change.emit(this.hideField);
    }

    confirmDelete(): void {
        let item: any = {loading: 0};
        if (this.selected) {
            item = this.selected;
        }
        item.loading++;
        this.service.deleteById(item.id, false)
            .then(() => {
                this.showSuccessDeletionMessage(this.selected);

                this.list.getItems(item);
                this.setFilters();

                this.closePage(true);
                this.hideField = false;
                this.state.change.emit(this.hideField);
            })
            .catch(() => {
            })
            .then(() => item.loading--);
    }

    showSuccessDeletionMessage(item: any): void {
        const confirmationMessage: string = this.translate
            .instant('contactDeleteConfirmation', {name: item.item.firstname});
        this.message.writeSuccess(confirmationMessage);
    }

    load(pageInfo: AddressBookModel) {
        pageInfo.contactFilter.forEach(item => {
            item.title = this.translate.instant(item.title);
        });
        this.locker.lock();
        this.addressBookModel = pageInfo;
        this.setFilters();

        if (!this.types) this.getTypes();
        else this.updateTypes();

        if (!this.countries) this.getCountries();
        else this.updateCountries();

        this.locker.unlock();
    }

    select(item: AddressBookItem) {
        this.editMode = false;

        this.sidebar.loading++;
        this.sidebar.visible = true;
        this.service.getAddressBookItem(item.id)
            .then((response: AddressBookItem) => {
                this.selected = response;
                this.setFormData();
                this.initSidebar();
            })
            .catch(() => {
            })
            .then(() => this.sidebar.loading--);
    }

    createClick() {
        this.router.navigateByUrl('/cabinet/address-book/create');
        this.list.buttons[0].inactive = true;
    }

    create() {

        this.editMode = true;

        let widthScreen: number;
        widthScreen = window.innerWidth;
        if (widthScreen < 1170) {
            this.hideField = true;
            this.state.change.emit(this.hideField);
        }

        this.sidebar.loading++;

        this.selected = null;
        this.selected = new AddressBookItem();
        this.editAddress();

        setTimeout(() => {
            this.sidebar.loading--;
        }, 500);
    }

    edit(item: AddressBookItem) {
        this.editMode = true;

        this.sidebar.loading++;
        this.sidebar.visible = true;
        this.service.getAddressBookItem(item.id)
            .then((response: AddressBookItem) => {
                this.selected = response;
                this.editAddress();
            })
            .catch(() => {
            })
            .then(() => this.sidebar.loading--);
    }

    save(): void {
        if (this.validateForms()) {
            this.setFilters();
            this.saveAddress();
        }
        else {
            this.scrollToFirstError();
        }
    }

    closePage(reload: boolean = false) {
        this._forceReload = reload;

        if (!reload) {
            super.close(() => this.close());
        }
        else {
            this.close();
        }
    }

    block() {
        this.modalBlock = new ModalEx('', this.selected.blacklist ? 'unblock' : 'block');
        this.modalBlock.title = this.translate.instant(this.modalBlock.title);

        const blockAlert: string = this.translate.instant(this.selected.blacklist
            ? 'contactUnblockAlert'
            : 'contactBlockAlert',
            {name: this.selected.firstname});
        this.modalBlock.body = blockAlert;

        this.modalBlock.buttons.forEach(button => {
            button.value = this.translate.instant(button.value);
        });
        this.modalBlock.show();
    }

    // -- component methods ---------------------------------------------------

    close(): void {
        this.resetForms();

        this.sidebar.visible = false;
        this.sidebar.mode = null;

        this.selected = null;
        if (this._forceReload) {
            this.list.getItems();
            this.setFilters();
        }
        this.list.buttons[0].inactive = false;
    }

    confirmBlock() {
        this.selected.loading++;
        this.service.blockByContact(this.selected.id, this.selected.blacklist)
            .then(() => {
                const blockMessage: string = this.translate.instant(this.selected.blacklist
                    ? 'contactUnblockConfirmation'
                    : 'contactBlockConfirmation',
                    {name: this.selected.firstname});
                this.message.writeSuccess(blockMessage);

                this.selected.loading--;
                this.closePage(true);
            })
            .catch((error) => {
                this.message.writeError(this.translate.instant(error.message));
            })
            .then(() => {
                if (this.selected !== null && this.selected.loading !== undefined) {
                    this.selected.loading--;
                }
            });
    }

    editAddress() {
        this.clearFormArray(this.contactPhonesFormArray);
        this.clearFormArray(this.contactEmailsFormArray);

        this.service.resetErrors();
        this.setFormData();

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Cancel', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(3, this.selected.id ? 'Save' : 'Create', 'success'));
        this.sidebar.mode = 'edit';
        this.sidebar.visible = true;
    }

    saveAddress(): void {
        this.sidebar.saving++;

        this.removeEmptyItems(this.selected.contactPhone);
        this.removeEmptyItems(this.selected.contactEmail);

        this.selected = new AddressBookItem(this.form.value);

        if (this.selected.id) {
            this.service.putById(this.selected.id, this.selected, false)
                .then(() => {
                    const szOkMessage: string = this.translate.instant('The changes have been saved successfully');
                    this.message.writeSuccess(szOkMessage);

                    this.closePage(true);
                }).catch(() => {
                this.setFormData();
            }).then(() => this.sidebar.saving--);
        }
        else {
            this.service.post('', this.selected, false)
                .then(() => {
                    const szOkMessage: string = this.translate.instant('Contact has been created successfully');
                    this.message.writeSuccess(szOkMessage);

                    this.closePage(true);
                }).catch(() => {
                this.setFormData();
            }).then(() => this.sidebar.saving--);
        }
    }

    addPhone() {
        this.selected = new AddressBookItem(this.form.value);

        const phoneModel = new ContactValueModel();
        this.selected.addContactPhone(phoneModel);

        this.setFormData();

        this.validationHost.initItems();
    }

    deletePhone(index: number) {
        this.selected.contactPhone.splice(index, 1);
        this.contactPhonesFormArray.removeAt(index);

        this.validationHost.initItems();
    }

    addEmail() {
        this.selected = new AddressBookItem(this.form.value);

        const emailModel = new ContactValueModel();
        this.selected.addContactEmail(emailModel);

        this.setFormData();

        this.validationHost.initItems();
    }

    deleteEmail(index: number) {
        this.selected.contactEmail.splice(index, 1);
        this.contactEmailsFormArray.removeAt(index);

        this.validationHost.initItems();
    }

    getTypes(): void {
        this.locker.lock();

        this.service.getTypes()
            .then(response => {
                this.types = response;
                this.types.contactPhone.forEach(item => {
                    item.value = this.translate.instant(item.value);
                });
                this.updateTypes();
                if (this.router.url === '/cabinet/address-book/create') {
                    this.list.buttons[0].inactive = true;
                    this.create();
                }
            })
            .catch(() => {
            })
            .then(() => this.locker.unlock());
    }

    updateTypes() {
        this.addressBookModel.types = this.types;
        this.addressBookModel.items.forEach(item => {
            item.contactPhone.forEach(phone => {
                phone.type = this.types.contactPhone.find(type => type.id === phone.typeId);
            });
        });

    }

    getCountries(): void {
        this.locker.lock();

        this.refs.getCountries().then(response => {
            this.countries = response;
            this.updateCountries();

            this.locker.unlock();
        }).catch(() =>
            this.locker.unlock());
    }

    updateCountries() {
        this.addressBookModel.countries = this.countries;
        this.addressBookModel.items.forEach(item => {
            item.country = this.countries.find(country => country.id === item.countryId);
        });
    }

    setFilters(): void {
        let keys: any;
        const filterValue = [];
        if (this.addressBookModel.contactFilter !== undefined) {
            this.addressBookModel.contactFilter.forEach(item => {
                filterValue.push({id: item.value, title: item.displayTitle, count: item.count});
            });
        }
        if (this.filters.length === 0) {
            this.filters.push(new FilterItem(1, 'type', 'Source', filterValue, 'title'));
            this.filters.push(new FilterItem(2, 'search', 'Search', null, null, this.translate.instant('Name, Phone or Email')));

            if (this.list.currentFilter) {
                keys = Object.keys(this.list.currentFilter);
                if (keys.length > 0 && this.list.currentFilter.type === 'blacklist') {
                    this.list.header.selectedFilter[0] = filterValue[1];
                    this.list.header.inputs.first.objectView = filterValue[1];
                    this.list.header.inputs.first.value = filterValue[1];
                }
                else {
                    this.list.header.selectedFilter[0] = filterValue[0];
                    if (this.list.header.inputs.first) {
                        this.list.header.inputs.first.objectView = filterValue[0];
                        this.list.header.inputs.first.value = filterValue[0];
                    }
                }
            }
            else {
                this.list.header.selectedFilter[0] = filterValue[0];
                if (this.list.header.inputs.first !== undefined) {
                    this.list.header.inputs.first.objectView = filterValue[0];
                    this.list.header.inputs.first.value = filterValue[0];
                }
            }
        }
        else {
            this.filters[0].options = filterValue;
            if (this.list.currentFilter) {
                keys = Object.keys(this.list.currentFilter);
                if (keys.length > 0 && this.list.currentFilter.type === 'blacklist') {
                    this.list.header.selectedFilter[0] = filterValue[1];
                    this.list.header.inputs.first.objectView = filterValue[1];
                    this.list.header.inputs.first.value = filterValue[1];
                }
                else {
                    this.list.header.selectedFilter[0] = filterValue[0];
                    if (this.list.header.inputs.first) {
                        this.list.header.inputs.first.objectView = filterValue[0];
                        this.list.header.inputs.first.value = filterValue[0];
                    }
                }
            }
            else {
                this.list.header.selectedFilter[0] = filterValue[0];
                if (this.list.header.inputs.first !== undefined) {
                    this.list.header.inputs.first.objectView = filterValue[0];
                    this.list.header.inputs.first.value = filterValue[0];
                }
            }
        }

        if ((this.filters[0].options[0].count + this.filters[0].options[1].count) > 0) {
            this.list.hideHeader = false;
        }
    }

    setPhoneType($event, i) {
        const phone = this.selected.contactPhone[i];
        phone.value = this.form.value.contactPhone[i].value;
        phone.typeId = $event.id;
        phone.type = this.types.contactPhone.find(item => item.id === phone.typeId);

        this.contactPhonesFormArray.at(i).patchValue(phone);
        this.contactPhonesFormArray.at(i).get('type').setValue(phone.type);
    }

    setFormData() {
        this.resetForms();

        if (this.selected.contactPhone.length === 0) {
            this.selected.addContactPhone(new ContactValueModel());
        }
        for (let i = 0; i < this.selected.contactPhone.length; i++) {
            let phone: any;
            if (!(this.selected.contactPhone[i] instanceof ContactValueModel)) {
                phone = this.selected.contactPhone[i];
                if (phone !== '') {
                    this.selected.contactPhone[i] = new ContactValueModel();
                    this.selected.contactPhone[i].value = phone;
                }
            }
            phone = this.selected.contactPhone[i];
            if (phone.type == null) {
                phone.type = this.types.contactPhone.find(item => item.id === phone.typeId);
            }

            let phoneControl: any;
            phoneControl = this.createPhoneFormControl(this.selected.contactPhone[i]);
            this.contactPhonesFormArray.setControl(i, phoneControl);
        }

        if (this.selected.contactEmail.length === 0) {
            this.selected.addContactEmail(new ContactValueModel());
        }
        for (let i = 0; i < this.selected.contactEmail.length; i++) {
            let email: any;
            if (!(this.selected.contactEmail[i] instanceof ContactValueModel)) {
                email = this.selected.contactEmail[i];
                if (email !== '') {
                    this.selected.contactEmail[i] = new ContactValueModel();
                    this.selected.contactEmail[i].value = email;
                }
            }

            email = this.selected.contactEmail[i];
            email.type = this.types.contactEmail.find(item => item.id === email.typeId);

            let emailControl: any;
            emailControl = this.createEmailFormControl(this.selected.contactEmail[i]);
            this.contactEmailsFormArray.setControl(i, emailControl);
        }

        if (this.selected.countryId) {
            this.selected.country = this.countries.find(item => item.id === this.selected.countryId);
        }

        this.form.patchValue(this.selected);
        if (this.selected.country) {
            this.form.get('country').patchValue(this.selected.country);
        }

        this.validationHost.initItems();
        this.validationHost.start();
        this.saveFormState();
    }

    removeEmptyItems(items: ContactValueModel[]) {
        if (items.length > 0) {
            for (let i = items.length - 1; i >= 0; i--) {
                items[i].resetType();
                if (!items[i].value) {
                    items.splice(i, 1);
                }
            }
        }
    }
}
