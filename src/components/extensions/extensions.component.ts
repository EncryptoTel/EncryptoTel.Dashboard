import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ExtensionsServices} from '../../services/extensions.services';
import {MainViewComponent} from '../main-view.component';
import {ExtensionModel} from "../../models/extension.model";
import {Router} from "@angular/router";

@Component({
    selector: 'extensions-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [ExtensionsServices]
})

export class ExtensionsComponent implements OnInit {

    extensions: ExtensionModel[];
    departments = {
        option: [{
            id: null, title: 'All'
        }],
        selected: null
    };
    loading: {
        body: number,
        pagination: boolean,
        sidebar: boolean
    };
    pageinfo: {
        page: number,
        limit: number,
        search: string,
        total: number,
        items: number
    };
    sidebar: ExtensionModel;
    selected: ExtensionModel;
    passwordTo: number;
    table = {
        title: ['#Ext', 'Phone Number', 'First Name', 'Last Name', 'E-mail', 'Mobile', 'Status', 'Default', ''],
        key: ['extension', 'phone', 'firstname', 'lastname', 'email', 'mobileApp', 'status', 'default'],
        width: [true, false, false, false, false, false, true, true, true],
        data: []
    };
    text = MainViewComponent.prototype;
    modal = {
        visible: false,
        title: '',
        text: '',
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };
    timer;

    constructor(private _extensions: ExtensionsServices,
                private router: Router) {

    }

    // exportExt(): void {
    //     etc.
    // }
    //
    // importExt(): void {
    //     etc.
    // }

    addExt(): void {
        // etc.
    }

    closeExt(): void {
        this.sidebar = null;
    }

    fillTableData(): void {
        this.table.data = [];
        for (let i = 0; i < this.pageinfo.limit && i < this.extensions.length; i++) {
            this.table.data.push({
                id: this.extensions[i].id,
                extension: this.extensions[i].phoneNumber,
                phone: this.extensions[i].sipOuter.phoneNumber,
                firstname: this.extensions[i].user ? this.extensions[i].user.firstname : null,
                // firstname: this.extensions[i].userFirstName,
                lastname: this.extensions[i].user ? this.extensions[i].user.lastname : null,
                email: this.extensions[i].user ? this.extensions[i].user.email : null,
                mobileApp: this.extensions[i].mobileApp,
                status: this.extensions[i].statusName,
                default: this.extensions[i].default
            });
        }
    }

    changePage(page: number): void {
        this.pageinfo.page = page;
        this.getExtensions();
    }

    viewExt(item: ExtensionModel) {
        if (!this.selected) {
            // console.log('viewExt');
            this.sidebar = this.sidebar ? (this.sidebar.id === item.id ? null : item) : item;
        }
    }

    doSearch() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            // console.log('timer');
            this.getExtensions();
            clearTimeout(this.timer);
        }, 500);

    }

    departmentChanged(item) {
        this.departments.selected = item;
        this.getExtensions();
    }

    sendPasswordToAdmin(item: ExtensionModel): void {
        // console.log('send to admin!');
        this.selected = item;
        this.passwordTo = 1;
        this.showModal('Reset password', 'Do you want to reset password and send new password to admin?', 'Reset');
    }

    sendPasswordToUser(item: ExtensionModel): void {
        // console.log('send to user!');
        this.selected = item;
        this.passwordTo = 2;
        this.showModal('Reset password', 'Do you want to reset password and send new password to user?', 'Reset');
    }

    confirmModal(): void {
        if (this.passwordTo > 0) {
            console.log(this.selected);
            this._extensions.changePassword(this.selected.id, {mobileApp: this.selected.mobileApp, toAdmin: this.passwordTo === 1, toUser: this.passwordTo === 2}).then(res => {
                console.log(res);
            });
        } else {
            this._extensions.deleteExtension(this.selected.id).then(res => {
                this.getExtensions();
            });
        }
        this.cancelModal();
    }

    cancelModal() {
        console.log('CancelModal');
        this.selected = null;
        this.passwordTo = 0;
    }

    clickDeleteIcon(item: ExtensionModel) {
        // console.log('clickDeleteIcon');
        this.selected = item;
        this.showModal('Delete extension', 'Do you want to delete this extension?', 'Delete');
    }

    clickEditIcon(item: ExtensionModel) {
        this.router.navigate(['cabinet', 'extensions', `${item.id}`]);
    }

    showModal(title: string, text: string, confirm: string): void {
        // console.log('showModal');
        this.modal.text = text;
        this.modal.title = title;
        this.modal.confirm.value = confirm;
        this.modal.visible = true;
    }

    getExtensions() {
        this.loading.body += 1;
        this._extensions.getExtensions(this.pageinfo.page, this.pageinfo.limit, this.pageinfo.search, this.departments.selected).then(res => {
            this.extensions = res['items'];
            res['departmentFilter'].map(item => {
                this.departments.option.push({id: item.id, title: `${item.name} (${item.sipCount})`});
            });
            this.pageinfo.page = res['page'];
            this.pageinfo.total = res['pageCount'];
            this.pageinfo.items = res['itemsCount'];
            this.fillTableData();
            this.loading.body -= 1;
        });
    }

    ngOnInit(): void {
        this.loading = {body: 0, pagination: true, sidebar: true};
        this.sidebar = null;
        this.departments.selected = this.departments.option[0];
        this.pageinfo = {
            page: 1, search: '', total: 1,
            limit: 10, //(window.innerHeight - 296 - (window.innerHeight - 296) % 40) / 40,
            items: 0
        };
        this.getExtensions();
    }

}
