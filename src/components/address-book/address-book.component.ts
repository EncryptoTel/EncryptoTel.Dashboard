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
import {PageInfoModel, SidebarButtonItem, SidebarInfoItem, SidebarInfoModel} from "../../models/base.model";
import {CountryModel} from "../../models/country.model";
import {ListComponent} from "../../elements/pbx-list/pbx-list.component";
import {FilterItem} from "../../elements/pbx-header/pbx-header.component";
import {MessageServices} from "../../services/message.services";

@Component({
    selector: 'pbx-address-book',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PageInfoModel],
    animations: [SwipeAnimation('x', '300ms'), FadeAnimation('300ms')]
})

export class AddressBookComponent implements OnInit {

    @ViewChild(ListComponent) list: ListComponent;

    pageInfo: AddressBookModel = new AddressBookModel();

    table = {
        titles: ['First Name', 'Last Name', 'Phone Number', 'E-mail', 'Company Name', 'Country'],
        keys: ['firstname', 'lastname', 'phone', 'email', 'company', 'country.title'],
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
            body: '',
            confirm: {type: 'error', value: 'Block'},
            decline: {type: 'cancel', value: 'Cancel'}
        },
    };

    types: TypesModel;

    countries: CountryModel[];

    filters: FilterItem[] = [];

    sidebar: SidebarInfoModel = new SidebarInfoModel();

    constructor(private service: AddressBookService,
                private refs: RefsServices,
                private message: MessageServices) {
        this.sidebar.hideEmpty = true;
    }

    create() {
        this.sidebar.loading++;
        this.selected = null;
        this.selected = new AddressBookItem();
        this.doEdit();
        setTimeout(() => {
            this.sidebar.loading--;
        }, 500);
    }

    select(item: AddressBookItem) {
        this.selected = item;
        this.prepareData();
        this.sidebar.mode = 'view';
        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Cancel', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, 'Edit', 'success'));
        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(4, 'First Name', this.selected.firstname));
        this.sidebar.items.push(new SidebarInfoItem(5, 'Last Name', this.selected.lastname));
        let phones = [];
        this.selected.contactPhone.map(item => {
            if (item.value) phones.push(item.value);
        });
        this.sidebar.items.push(new SidebarInfoItem(6, phones.length > 1 ? 'Phones' : 'Phone', phones));
        let emails = [];
        this.selected.contactEmail.map(item => {
            if (item.value) emails.push(item.value);
        });
        this.sidebar.items.push(new SidebarInfoItem(7, emails.length > 1 ? 'Emails' : 'Email', emails));
        this.sidebar.items.push(new SidebarInfoItem(8, 'Company Name', this.selected.company));
        // this.sidebar.items.push(new SidebarInfoItem(9, 'Department', this.selected.department));
        this.sidebar.items.push(new SidebarInfoItem(10, 'Country', this.selected.countryName));
        // this.sidebar.items.push(new SidebarInfoItem(11, 'Address', this.selected.address));
        this.sidebar.items.push(new SidebarInfoItem(12, this.selected.blacklist ? 'Unblock contact' : 'Block contact', null, true, false, true));
        this.sidebar.items.push(new SidebarInfoItem(13, 'Delete contact', null, true, false, true));
        this.sidebar.visible = true;
    }

    click(item) {
        switch (item.id) {
            case 1:
                this.close();
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
                this.delete();
                break;
        }
    }

    doEdit() {
        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Cancel', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(3, this.selected.id ? 'Save' : 'Create', 'success'));
        this.service.resetErrors();
        this.prepareData();
        this.sidebar.mode = 'edit';
        this.sidebar.visible = true;
    }

    edit(item: AddressBookItem) {
        this.sidebar.loading++;
        this.sidebar.visible = true;
        this.service.getById(item.id).then((res: AddressBookItem) => {
            this.selected = new AddressBookItem(res);
            this.doEdit();
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
        this.pageInfo = pageInfo;
        const filterValue = [];
        this.pageInfo.contactFilter.forEach(item => {
            filterValue.push({id: item.value, title: item.displayTitle, count: item.count});
        });
        if (this.filters.length === 0) {
            this.filters.push(new FilterItem(1, 'type', 'Select Source', filterValue, 'title'));
            this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search by Name or Phone'));
            this.list.header.selectedFilter[0] = filterValue[0];
        } else {
            this.filters[0].options = filterValue;
        }

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
        this.modal.block.confirm.value = this.selected.blacklist ? 'Unblock' : 'Block';
        this.modal.block.body = `Are you sure you want to ${this.selected.blacklist ? 'unblock' : 'block'} this contact?`;
        this.modal.block.visible = true;
    }

    confirmBlock() {
        this.selected.loading++;
        this.service.blockByContact(this.selected.id, this.selected.blacklist).then(res => {
            this.message.writeSuccess(this.selected.blacklist ? 'Contact unblocked successfully' : 'Contact blocked successfully');
            this.close(true);
            this.selected.loading--;
        }).catch(() => {
            this.selected.loading--;
        });
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
        this.sidebar.saving++;
        this.checkEmpty(this.selected.contactPhone);
        this.checkEmpty(this.selected.contactEmail);

        if (this.selected.id) {
            this.service.putById(this.selected.id, this.selected).then(res => {
                this.sidebar.saving--;
                this.close(true);
            }).catch(res => {
                this.prepareData();
                this.sidebar.saving--;
            });
        } else {
            this.service.post('', this.selected).then(res => {
                this.sidebar.saving--;
                this.close(true);
            }).catch(res => {
                this.prepareData();
                this.sidebar.saving--;
            });
        }
    }

    ngOnInit() {

    }

}
