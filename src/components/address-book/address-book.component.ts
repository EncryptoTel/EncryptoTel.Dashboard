import {ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormArray, FormControl} from '@angular/forms';
import {AddressBookService} from '../../services/address-book.service';
import {
    AddressBookItem,
    AddressBookModel,
    ContactValueModel,
    TypesModel
} from '../../models/address-book.model';
import {RefsServices} from '../../services/refs.services';
import {FilterItem, PageInfoModel, SidebarButtonItem, SidebarInfoItem, SidebarInfoModel} from '../../models/base.model';
import {CountryModel} from '../../models/country.model';
import {ListComponent} from '../../elements/pbx-list/pbx-list.component';
import {MessageServices} from '../../services/message.services';
import {ModalEx} from '../../elements/pbx-modal/pbx-modal.component';
import {AnimationComponent} from '../../shared/shared.functions';
import {nameRegExp, emailRegExp, phoneRegExp} from '../../shared/vars';
import {FormBaseComponent} from '../../elements/pbx-form-base-component/pbx-form-base-component.component';


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

    modalBlock: ModalEx;

    private _forceReload: boolean;

    // -- properties ----------------------------------------------------------

    get addressForm(): FormGroup {
        return this.form;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(public service: AddressBookService,
                private refs: RefsServices,
                private message: MessageServices,
                protected _fb: FormBuilder) {
        super(_fb);
        
        this.addressBookModel = new AddressBookModel();
        this.addressListHeaders = {
            titles: ['First Name', 'Last Name', 'Phone Number', 'E-mail', 'Company Name', 'Country'],
            keys: ['firstname', 'lastname', 'phone', 'email', 'company', 'country.title'],
        };
    
        this.modalBlock = new ModalEx('', 'block');

        this.filters = [];
        this.sidebar = new SidebarInfoModel();
        this.sidebar.hideEmpty = true;
        this.itemsCache = [];

        this.validationHost.customMessages = [
            { name: 'Phone', error: 'pattern', message: 'Please enter valid phone number' },
            { name: 'Email', error: 'pattern', message: 'Please enter valid email address' },
        ];
    }

    ngOnInit() {}

    // -- initialize section --------------------------------------------------

    initSidebar(): void {
        this.sidebar.mode = 'view';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, 'Edit', 'success'));

        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(4, 'First Name', this.selected.firstname));
        this.sidebar.items.push(new SidebarInfoItem(5, 'Last Name', this.selected.lastname));

        let phones = [];
        this.selected.contactPhone.forEach(item => {
            if (item.value) phones.push(item.value);
        });
        this.sidebar.items.push(new SidebarInfoItem(6, phones.length > 1 ? 'Phones' : 'Phone', phones));

        let emails = [];
        this.selected.contactEmail.forEach(item => {
            if (item.value) emails.push(item.value);
        });
        this.sidebar.items.push(new SidebarInfoItem(7, emails.length > 1 ? 'Emails' : 'Email', emails));

        this.sidebar.items.push(new SidebarInfoItem(8, 'Company Name', this.selected.company));
        this.sidebar.items.push(new SidebarInfoItem(9, 'Department', this.selected.department));
        this.sidebar.items.push(new SidebarInfoItem(9, 'Position', this.selected.position));
        this.sidebar.items.push(new SidebarInfoItem(10, 'Country', this.selected.countryName));
        this.sidebar.items.push(new SidebarInfoItem(11, 'Address', this.selected.address));
        this.sidebar.items.push(new SidebarInfoItem(12, this.selected.blacklist ? 'Unblock contact' : 'Block contact', null, true, false, true));
        this.sidebar.items.push(new SidebarInfoItem(13, 'Delete contact', null, true, false, true));
        
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

        this.form = this._fb.group({
            id:             [ null ],
            firstname:      [ null, [ Validators.required, Validators.pattern(nameRegExp) ] ],
            lastname:       [ null, [ Validators.pattern(nameRegExp) ] ],
            contactPhone:   this._fb.array([], Validators.required),
            contactEmail:   this._fb.array([], Validators.required),
            company:        [ null, [ Validators.pattern(nameRegExp) ] ],
            department:     [ null, [ Validators.pattern(nameRegExp) ] ],
            position:       [ null ],
            address:        [ null ],
            country:        this._fb.group({
                code:       [ null ],
                id:         [ null ],
                phoneCode:  [ null ],
                title:      [ null ],
            }),
        });

        // let phoneControl = this.createPhoneFormControl(null);
        // this.contactPhonesFormArray.push(phoneControl);

        // let emailControl = this.createEmailFormControl(null);
        // this.contactEmailsFormArray.push(emailControl);
    }
    
    createPhoneFormControl(model: ContactValueModel): FormGroup {
        return this._fb.group({
            value:  [ model ? model.value : null, [ Validators.required, Validators.pattern(phoneRegExp) ] ],
            typeId: [ model ? model.typeId : null ],
            type:   [ model ? model.type : null ],
        });
    }

    createEmailFormControl(model: ContactValueModel): FormGroup {
        return this._fb.group({
            value:  [ model ? model.value : null, [ Validators.required, Validators.pattern(emailRegExp) ] ],
            typeId: [ model ? model.typeId : null ],
            type:   [ model ? model.type : null ],
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
            if (next && !String(next).match(new RegExp(/^-?[0-9A-Za-z]+$/g))) {
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
            case 1:  this.close(); break;
            case 2:  this.edit(this.selected); break;
            case 3:  this.save(); break;
            case 12: this.block(); break;
            case 13: this.list.items.clickDeleteItem(this.selected); break;
        }
    }

    load(pageInfo: AddressBookModel) {
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
        this.sidebar.loading ++;
        this.sidebar.visible = true;
        this.service.getAddressBookItem(item.id).then((response: AddressBookItem) => {
            this.selected = response;
            this.setFormData();
            this.initSidebar();
        }).catch(() => {})
            .then(() => this.sidebar.loading --);
    }

    create() {
        this.sidebar.loading ++;

        this.selected = null;
        this.selected = new AddressBookItem();
        this.editAddress();

        setTimeout(() => {
            this.sidebar.loading --;
        }, 500);
    }

    edit(item: AddressBookItem) {
        this.sidebar.loading ++;
        this.sidebar.visible = true;
        this.service.getAddressBookItem(item.id).then((response: AddressBookItem) => {
            this.selected = response;
            this.editAddress();
        }).catch(() => {})
            .then(() => this.sidebar.loading --);
    }

    save(): void {
        if (this.validateForms()) {
            this.saveAddress();
        }
    }

    close(reload: boolean = false) {
        this._forceReload = reload;

        if (!reload) {
            super.close(!this.isNewFormModel, () => this.confirmClose());
        }
        else {
            this.confirmClose();
        }
    }

    block() {
        this.modalBlock = new ModalEx('', this.selected.blacklist ? 'unblock' : 'block');
        this.modalBlock.show();
    }

    // -- component methods ---------------------------------------------------

    confirmClose(): void {
        this.sidebar.visible = false;
        this.sidebar.mode = null;

        this.selected = null;
        if (this._forceReload) {
            this.list.getItems();
        }
    }

    confirmBlock() {
        this.selected.loading ++;
        this.service.blockByContact(this.selected.id, this.selected.blacklist).then(res => {
            this.message.writeSuccess(this.selected.blacklist ? 'Contact unblocked successfully' : 'Contact blocked successfully');
            this.selected.loading --;
            this.close(true);
        }).catch(() => {})
            .then(() => this.selected.loading --);
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
        this.sidebar.saving ++;
        this.removeEmptyItems(this.selected.contactPhone);
        this.removeEmptyItems(this.selected.contactEmail);

        this.selected = new AddressBookItem(this.form.value);

        if (this.selected.id) {
            this.service.putById(this.selected.id, this.selected).then(() => {
                this.close(true);
            }).catch(() => {
                this.setFormData();
            }).then(() => this.sidebar.saving --);
        } 
        else {
            this.service.post('', this.selected).then(() => {
                this.close(true);
            }).catch(() => {
                this.setFormData();
            }).then(() => this.sidebar.saving --);
        }
    }

    addPhone() {
        this.selected = new AddressBookItem(this.form.value);

        let phoneModel = new ContactValueModel();
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

        let emailModel = new ContactValueModel();
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

        this.service.getTypes().then(response => {
            this.types = response;
            this.updateTypes();
            
            this.locker.unlock();
        }).catch(() => 
            this.locker.unlock());
    }

    updateTypes() {
        this.addressBookModel.types = this.types;
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
        const filterValue = [];
        this.addressBookModel.contactFilter.forEach(item => {
            filterValue.push({id: item.value, title: item.displayTitle, count: item.count});
        });
        if (this.filters.length === 0) {
            this.filters.push(new FilterItem(1, 'type', 'Source', filterValue, 'title'));
            this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search by Name or Phone'));
            this.list.header.selectedFilter[0] = filterValue[0];
        } else {
            this.filters[0].options = filterValue;
        }
    }

    setFormData() {
        super.resetForms();

        if (this.selected.contactPhone.length === 0) {
            this.selected.addContactPhone(new ContactValueModel());
        }
        for (let i = 0; i < this.selected.contactPhone.length; i ++) {
            let phone = this.selected.contactPhone[i];
            phone.type = this.types.contactPhone.find(item => item.id === phone.typeId);

            let phoneControl = this.createPhoneFormControl(this.selected.contactPhone[i]);
            this.contactPhonesFormArray.setControl(i, phoneControl);
        }

        if (this.selected.contactEmail.length === 0) {
            this.selected.addContactEmail(new ContactValueModel());
        }
        for (let i = 0; i < this.selected.contactEmail.length; i++) {
            let email = this.selected.contactEmail[i];
            email.type = this.types.contactEmail.find(item => item.id === email.typeId);

            let emailControl = this.createEmailFormControl(this.selected.contactEmail[i]);
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
