import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ExtensionService} from '../../services/extension.service';
import {MainViewComponent} from '../main-view.component';
import {ExtensionItem, ExtensionModel, SipDepartmentItem} from "../../models/extension.model";
import {Router} from "@angular/router";
import {MessageServices} from "../../services/message.services";
import {ListComponent} from "../../elements/pbx-list/pbx-list.component";
import {FilterItem} from "../../elements/pbx-header/pbx-header.component";

@Component({
    selector: 'extensions-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [ExtensionService]
})

export class ExtensionsComponent implements OnInit {

    @ViewChild(ListComponent) list;

    pageInfo: ExtensionModel = new ExtensionModel();

    loading: {
        body: number,
        pagination: boolean,
        sidebar: boolean,
        admin: boolean,
        user: boolean
    };
    sidebar: ExtensionItem = null;
    selected: ExtensionItem;
    passwordTo: number;
    table = {
        titles: ['#Ext', 'Phone Number', 'First Name', 'Last Name', 'E-mail', 'Status', 'Default', ''],
        keys: ['extension', 'phone', 'userFirstName', 'userLastName', 'userEmail', 'statusName', 'default'],
        widths: [true, false, false, false, false, true, true, true],
    };
    text = MainViewComponent.prototype;
    modal = {
        visible: false,
        title: '',
        text: '',
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };
    filters: FilterItem[] = [];

    constructor(private service: ExtensionService,
                private router: Router,
                private _messages: MessageServices) {

    }

    closeExt(): void {
        this.sidebar = null;
    }

    select(item: ExtensionItem) {
        if (!this.selected) {
            // console.log('viewExt');
            this.sidebar = this.sidebar ? (this.sidebar.id === item.id ? null : item) : item;
        }
    }

    sendPasswordToAdmin(item: ExtensionItem): void {
        // console.log('send to admin!');
        this.selected = item;
        this.passwordTo = 1;
        this.showModal('Reset password', 'Do you want to reset your password and send the new password to admin?', 'Reset');
    }

    sendPasswordToUser(item: ExtensionItem): void {
        // console.log('send to user!');
        this.selected = item;
        this.passwordTo = 2;
        this.showModal('Reset password', 'Do you want to reset your password and send the new password to user?', 'Reset');
    }

    confirmModal(): void {
        if (this.passwordTo > 0) {
            // console.log(this.selected);
            this.loading.admin = this.passwordTo === 1;
            this.loading.user = this.passwordTo === 2;
            this.service.changePassword(this.selected.id, {mobileApp: this.selected.mobileApp, toAdmin: this.passwordTo === 1, toUser: this.passwordTo === 2}).then(res => {
                this._messages.writeSuccess(res.message);
                this.loading.admin = false;
                this.loading.user = false;
                // console.log(res);
            });
        } else {
            this.service.deleteExtension(this.selected.id).then(res => {
                // this.getList();
            });
        }
        this.cancelModal();
    }

    cancelModal() {
        // console.log('CancelModal');
        this.selected = null;
        this.passwordTo = 0;
    }

    showModal(title: string, text: string, confirm: string): void {
        // console.log('showModal');
        this.modal.text = text;
        this.modal.title = title;
        this.modal.confirm.value = confirm;
        this.modal.visible = true;
    }

    load() {
        this.sidebar = null;
        if (this.filters.length === 0) {
            this.filters.push(new FilterItem(1, 'department', 'Department', this.list.pageInfo.departmentFilter, 'displayName'));
            this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search by Name or Phone'));
        }
    }

    ngOnInit(): void {
        this.loading = {body: 0, pagination: true, sidebar: true, admin: false, user: false};
    }

}
