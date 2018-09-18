import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ExtensionService} from '../../services/extension.service';
import {MainViewComponent} from '../main-view.component';
import {ExtensionItem, ExtensionModel} from '../../models/extension.model';
import {Router, ActivatedRoute} from '@angular/router';
import {MessageServices} from '../../services/message.services';
import {ListComponent} from '../../elements/pbx-list/pbx-list.component';
import {FilterItem, TableInfoExModel, TableInfoItem} from '../../models/base.model';
import {ModalEx} from '../../elements/pbx-modal/pbx-modal.component';
import { RouterExtService } from '../../services/router-ext.service';

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
    table: TableInfoExModel = new TableInfoExModel();
    text = MainViewComponent.prototype;
    modal = new ModalEx();
    filters: FilterItem[] = [];

    constructor(public service: ExtensionService,
                private _routerEx: RouterExtService,
                private _messages: MessageServices) {
        this.table.items.push(new TableInfoItem('#Ext', 'extension', null, 80));
        this.table.items.push(new TableInfoItem('Phone Number', 'phone'));
        this.table.items.push(new TableInfoItem('First Name', 'userFirstName'));
        this.table.items.push(new TableInfoItem('Last Name', 'userLastName'));
        this.table.items.push(new TableInfoItem('E-mail', 'userEmail'));
        this.table.items.push(new TableInfoItem('Status', 'statusName', null, 80));
        this.table.items.push(new TableInfoItem('Default', 'default', null, 80));
        
        setTimeout(() => {
            this.restoreLastPageInfo();
            console.log('router', _routerEx, this.pageInfo);
        }, 300);
    }

    restoreLastPageInfo(): void {
        if (this._routerEx.lastUrl && this.checkLastUrl()) {
            this.pageInfo.page = +sessionStorage.getItem('extensions_page');
            this.pageInfo.limit = +sessionStorage.getItem('extensions_size');
        }
    }

    checkLastUrl(): boolean {
        let reUrl = new RegExp(/extensions\/\d+/i);
        return !!this._routerEx.lastUrl && reUrl.test(this._routerEx.lastUrl);
    }

    closeExt(): void {
        this.sidebar = null;
    }

    select(item: ExtensionItem) {
        if (!this.selected) {
            this.sidebar = this.sidebar ? (this.sidebar.id === item.id ? null : item) : item;
        }
    }

    sendPasswordToAdmin(item: ExtensionItem): void {
        this.selected = item;
        this.passwordTo = 1;
        this.modal = new ModalEx('', 'resetToAdmin');
        this.modal.visible = true;
    }

    sendPasswordToUser(item: ExtensionItem): void {
        this.selected = item;
        this.passwordTo = 2;
        this.modal = new ModalEx('', 'resetToUser');
        this.modal.visible = true;
    }

    confirmModal(): void {
        if (this.passwordTo > 0) {
            this.loading.admin = this.passwordTo === 1;
            this.loading.user = this.passwordTo === 2;
            this.service.changePassword(this.selected.id, {mobileApp: this.selected.mobileApp, toAdmin: this.passwordTo === 1, toUser: this.passwordTo === 2}).then(res => {
                this._messages.writeSuccess(res.message);
                this.loading.admin = false;
                this.loading.user = false;
            });
        } else {
            this.service.deleteExtension(this.selected.id).then(res => {
                // this.getList();
            });
        }
        this.cancelModal();
    }

    cancelModal() {
        this.selected = null;
        this.passwordTo = 0;
    }

    load() {
        this.sidebar = null;
        if (this.filters.length === 0) {
            this.filters.push(new FilterItem(1, 'department', 'Department', this.list.pageInfo.departmentFilter, 'displayName', '[choose one]'));
            this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search by Name or Phone'));
        }
    }

    ngOnInit(): void {
        this.loading = {body: 0, pagination: true, sidebar: true, admin: false, user: false};
    }

}
