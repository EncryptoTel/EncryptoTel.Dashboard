import {Component, OnInit, ViewChild} from '@angular/core';
import {AddressBookService} from '../../services/address-book.service';
import {
    AddressBookItem,
    AddressBookModel,
    ContactValueModel,
    TypesModel
} from '../../models/address-book.model';
import {RefsServices} from '../../services/refs.services';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {FadeAnimation} from '../../shared/fade-animation';
import {PageInfoModel} from "../../models/base.model";
import {CountryModel} from "../../models/country.model";
import {classToPlain, plainToClass} from "class-transformer";
import {ListComponent} from "../../elements/pbx-list/pbx-list.component";
import {FilterItem} from "../../elements/pbx-header/pbx-header.component";

@Component({
    selector: 'pbx-address-book',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PageInfoModel],
    animations: [SwipeAnimation('x', '300ms'), FadeAnimation('300ms')]
})

export class AddressBookComponent implements OnInit {

    @ViewChild(ListComponent) list;

    pageInfo: AddressBookModel = new AddressBookModel();

    table = {
        titles: ['First Name', 'Last Name', 'Phone Number', 'E-mail', 'Company Name', 'Country'],
        keys: ['firstname', 'lastname', 'phone', 'email', 'company', 'country.title'],
    };

    sidebar = {
        visible: false,
        loading: 0,
        saving: 0,
        mode: ''
    };
    loading: number = 0;

    selected: AddressBookItem;

    modal = {
        delete: {
            visible: false,
            confirm: {type: 'error', value: 'Delete'},
            decline: {type: 'cancel', value: 'Cancel'}
        },
        block: {
            visible: false,
            confirm: {type: 'error', value: 'Block'},
            decline: {type: 'cancel', value: 'Cancel'}
        },
    };

    types: TypesModel;

    countries: CountryModel[];

    filters: FilterItem[] = [];

    constructor(private service: AddressBookService,
                private refs: RefsServices) {
        this.filters.push(new FilterItem(1, 'type', 'Select Source', [
            {id: 'all', title: 'All'},
            {id: 'my', title: 'My'},
            {id: 'company', title: 'Company'},
            {id: 'blacklist', title: 'Black List'},
        ], 'title'));
        this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search by Name or Phone'));
    }

    create() {
        this.sidebar.loading++;
        this.service.resetErrors();
        this.selected = null;
        this.selected = new AddressBookItem();
        this.prepareData();
        this.sidebar.mode = 'edit';
        this.sidebar.visible = true;
        setTimeout(() => {
            this.sidebar.loading--;
        }, 500);
    }

    select(item: AddressBookItem) {
        this.selected = item;
        this.prepareData();
        this.sidebar.mode = 'view';
        this.sidebar.visible = true;
    }

    edit(item: AddressBookItem) {
        this.sidebar.loading++;
        this.sidebar.mode = 'edit';
        this.sidebar.visible = true;
        this.service.resetErrors();
        this.service.getById(item.id).then((res: AddressBookItem) => {
            this.selected = new AddressBookItem(res);
            console.log(this.selected);
            this.prepareData();
            this.sidebar.loading--;
        }).catch(res => {
            this.sidebar.loading--;
        });
    }

    updateTypes() {
        this.pageInfo.types = this.types;
    }

    updateCountries() {
        this.pageInfo.countries = this.countries;
        for (let i = 0; i < this.pageInfo.items.length; i++) {
            let contact = this.pageInfo.items[i];
            contact.country = this.countries.find(item => item.id === contact.countryId);
        }
    }

    load(pageInfo: AddressBookModel) {
        // console.log('load');
        this.pageInfo = pageInfo;
        if (!this.types) {
            this.loading++;
            this.service.getTypes().then(res => {
                this.types = res;
                this.updateTypes();
                this.loading--;
            }).catch(err => {
                this.loading--;
            });
        } else {
            this.updateTypes();
        }
        if (!this.countries) {
            this.loading++;
            this.refs.getCountries().then(res => {
                this.countries = res;
                this.updateCountries();
                this.loading--;
            }).catch(err => {
                this.loading--;
            });
        } else {
            this.updateCountries();
        }
    }

    close(reload: boolean = false) {
        this.sidebar.visible = false;
        this.selected = null;
        this.sidebar.mode = null;
        if (reload) {
            this.list.getItems();
        }
    }

    block() {
        this.modal.block.visible = true;
    }

    confirmBlock() {
        console.log('confirmBlock');
    }

    delete() {
        this.modal.delete.visible = true;
    }

    confirmDelete() {
        this.list.delete(this.selected);
        this.close(true);
    }

    addPhone() {
        this.selected.contactPhone.push(new ContactValueModel());
    }

    deletePhone(index: number) {
        this.selected.contactPhone.splice(index, 1);
    }

    addEmail() {
        this.selected.contactEmail.push(new ContactValueModel());
    }

    deleteEmail(index: number) {
        this.selected.contactEmail.splice(index, 1);
    }

    prepareData() {
        if (this.selected.contactPhone.length === 0) this.selected.addContactPhone(new ContactValueModel());
        if (this.selected.contactEmail.length === 0) this.selected.addContactEmail(new ContactValueModel());
        for (let i = 0; i < this.selected.contactPhone.length; i++) {
            let phone = this.selected.contactPhone[i];
            phone.type = this.types.contactPhone.find(item => item.id === phone.typeId);
        }
        for (let i = 0; i < this.selected.contactEmail.length; i++) {
            let email = this.selected.contactEmail[i];
            email.type = this.types.contactEmail.find(item => item.id === email.typeId);
        }
        this.selected.country = this.countries.find(item => item.id === this.selected.countryId);
    }

    checkEmpty(items: ContactValueModel[]) {
        if (items.length > 0) {
            for (let i = items.length - 1; i >= 0; i--) {
                items[i].resetType();
                if (!items[i].value) {
                    items.splice(i, 1);
                }
            }
        }
    }

    save() {
        this.sidebar.loading++;
        this.checkEmpty(this.selected.contactPhone);
        this.checkEmpty(this.selected.contactEmail);

        if (this.selected.id) {
            this.service.putById(this.selected.id, this.selected).then(res => {
                this.sidebar.loading--;
                this.close(true);
            }).catch(res => {
                this.prepareData();
                this.sidebar.loading--;
            });
        } else {
            this.service.post('', this.selected).then(res => {
                this.sidebar.loading--;
                this.close(true);
            }).catch(res => {
                this.prepareData();
                this.sidebar.loading--;
            });
        }
    }

    ngOnInit() {

    }

}