import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ExtensionService} from '../../services/extension.service';
import {MainViewComponent} from '../main-view.component';
import {ExtensionItem, ExtensionModel, SipDepartmentItem} from "../../models/extension.model";
import {Router} from "@angular/router";
import {MessageServices} from "../../services/message.services";

@Component({
    selector: 'extensions-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [ExtensionService]
})

export class ExtensionsComponent implements OnInit {

    pageInfo: ExtensionModel = new ExtensionModel();
    searchStr;
    departmentSelected: SipDepartmentItem;

    loading: {
        body: number,
        pagination: boolean,
        sidebar: boolean,
        admin: boolean,
        user: boolean
    };
    sidebar: ExtensionItem;
    selected: ExtensionItem;
    passwordTo: number;
    table = {
        title: ['#Ext', 'Phone Number', 'First Name', 'Last Name', 'E-mail', 'Status', 'Default', ''],
        key: ['extension', 'phone', 'userFirstName', 'userLastName', 'userEmail', 'status', 'default'],
        width: [true, false, false, false, false, true, true, true],
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

    constructor(private service: ExtensionService,
                private router: Router,
                private _messages: MessageServices) {

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

    viewExt(item: ExtensionItem) {
        if (!this.selected) {
            // console.log('viewExt');
            this.sidebar = this.sidebar ? (this.sidebar.id === item.id ? null : item) : item;
        }
    }

    doSearch() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            // console.log('timer');
            this.getList();
            clearTimeout(this.timer);
        }, 500);

    }

    departmentChanged(item) {
        this.departmentSelected = item;
        this.getList();
    }

    sendPasswordToAdmin(item: ExtensionItem): void {
        // console.log('send to admin!');
        this.selected = item;
        this.passwordTo = 1;
        this.showModal('Reset password', 'Do you want to reset password and send new password to admin?', 'Reset');
    }

    sendPasswordToUser(item: ExtensionItem): void {
        // console.log('send to user!');
        this.selected = item;
        this.passwordTo = 2;
        this.showModal('Reset password', 'Do you want to reset password and send new password to user?', 'Reset');
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
                this.getList();
            });
        }
        this.cancelModal();
    }

    cancelModal() {
        // console.log('CancelModal');
        this.selected = null;
        this.passwordTo = 0;
    }

    clickDeleteIcon(item: ExtensionItem) {
        // console.log('clickDeleteIcon');
        this.selected = item;
        this.showModal('Delete extension', 'Do you want to delete this extension?', 'Delete');
    }

    clickEditIcon(item: ExtensionItem) {
        this.router.navigate(['cabinet', 'extensions', `${item.id}`]);
    }

    showModal(title: string, text: string, confirm: string): void {
        // console.log('showModal');
        this.modal.text = text;
        this.modal.title = title;
        this.modal.confirm.value = confirm;
        this.modal.visible = true;
    }

    getDepartmentId() {
        return this.departmentSelected ? this.departmentSelected.id : null;
    }

    getList() {
        this.loading.body += 1;
        this.service.getExtensions(this.pageInfo, {
            search: this.searchStr,
            department: this.getDepartmentId(),
            departmentFilter: true
        }).then((res: ExtensionModel) => {
            this.pageInfo = res;
            // console.log(this.pageInfo);
            // res['departmentFilter'].map(item => {
            //     this.departments.option.push({id: item.id, title: `${item.name} (${item.sipCount})`});
            // });
            // this.fillTableData();
            if (!this.departmentSelected) this.departmentSelected = this.pageInfo.departmentFilter[0];

            this.loading.body -= 1;
            this.loading.pagination = false;
        });
    }

    ngOnInit(): void {
        this.loading = {body: 0, pagination: true, sidebar: true, admin: false, user: false};
        this.sidebar = null;
        this.getList();
    }

}
