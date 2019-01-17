import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PhoneNumberService } from '../../services/phone-number.service';
import { SidebarButtonItem, SidebarInfoItem, SidebarInfoModel, TableInfoModel, TableInfoExModel, TableInfoItem } from '../../models/base.model';
import { SwipeAnimation } from '../../shared/swipe-animation';
import { NavigationEnd, Router } from '@angular/router';
import { PhoneNumberItem, PhoneNumberModel } from '../../models/phone-number.model';
import { PhoneNumberExternalModel } from '../../models/phone-number-external.model';
import { ListComponent } from '../../elements/pbx-list/pbx-list.component';
import { MessageServices } from '../../services/message.services';
import { TranslateService } from '@ngx-translate/core';
import { ButtonItem } from '@models/base.model';

@Component({
    selector: 'phone-numbers-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PhoneNumberService],
    animations: [SwipeAnimation('x', '300ms')]
})

export class PhoneNumbersComponent implements OnInit {

    loading: number;
    tableModel: TableInfoExModel = new TableInfoExModel();

    tableInfo: TableInfoModel = {
        titles: ['Phone Number', 'Amount of Exts', 'Default Ext', 'Status', 'Number type'],
        keys: ['phoneNumberWithType', 'innersCount', 'defaultInner', 'statusName', 'typeName']
    };
    selected: PhoneNumberItem;
    buttons: ButtonItem[] = [];
    pageInfo: PhoneNumberModel = new PhoneNumberModel();
    phoneExternal: PhoneNumberExternalModel = new PhoneNumberExternalModel();
    sidebar: SidebarInfoModel = new SidebarInfoModel();
    sidebarVisible: boolean = false;
    editMode: boolean = false;
    addExternalPhoneNumber: boolean = false;

    @ViewChild('row') row: ElementRef;
    @ViewChild('table') table: ElementRef;
    @ViewChild('button') button: ElementRef;
    @ViewChild(ListComponent) list: ListComponent;

    showPassword: boolean = false;
    errors: any;

    constructor(public service: PhoneNumberService,
        public router: Router,
        private message: MessageServices,
        public translate: TranslateService) {
        this.sidebar.title = '';
        this.loading = 0;
        this.tableInfo = {
            titles: [
                this.translate.instant('Phone Number'),
                this.translate.instant('Amount of Exts'),
                this.translate.instant('Default Ext'),
                this.translate.instant('Status'),
                this.translate.instant('Number type')
            ],
            keys: ['phoneNumberWithType', 'innersCount', 'defaultInner', 'statusName', 'typeName']
        };

        this.tableModel.sort.isDown = true;
        this.tableModel.sort.column = 'firstname';
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Phone Number'), 'phoneNumberWithType', 'phoneNumberWithType'));
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Amount of Exts'), 'innersCount', 'innersCount'));
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Default Ext'), 'defaultInner', 'defaultInner'));
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Status'), 'statusName', 'statusName'));
        this.tableModel.items.push(new TableInfoItem(this.translate.instant('Number type'), 'typeName', 'typeName'));

        this.buttons.push(new ButtonItem(10, this.translate.instant('Buy Phone Number'), 'success', true));
        this.buttons.push(new ButtonItem(11, this.translate.instant('Add External Phone'), 'accent', true));
        this.errors = {
            host: null,
            port: null,
            password: null,
            phoneNumber: null,
            login: null
        };
    }

    resetErrors() {
        this.errors = {
            host: null,
            port: null,
            password: null,
            phoneNumber: null,
            login: null
        };
    }

    changePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    select(item: any): void {
        this.sidebar = new SidebarInfoModel();
        this.addExternalPhoneNumber = false;
        this.buttons[1].inactive = false;
        this.sidebarVisible = true;
        this.editMode = false;
        this.selected = item;
        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, this.translate.instant('Cancel'), 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, this.translate.instant(this.selected.status ? 'phoneDisable' : 'phoneEnable'), 'accent'));
        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(3, this.translate.instant('Phone Number'), this.selected.providerId !== 1 ? '+' + this.selected.phoneNumber : this.selected.phoneNumber));
        this.sidebar.items.push(new SidebarInfoItem(4, this.translate.instant('Amount of Exts'), this.selected.innersCount));
        this.sidebar.items.push(new SidebarInfoItem(5, this.translate.instant('Default Ext'), this.selected.defaultInner));
        this.sidebar.items.push(new SidebarInfoItem(6, this.translate.instant('Status'), this.translate.instant(this.selected.statusName)));
        this.sidebar.items.push(new SidebarInfoItem(7, this.translate.instant('Phone number type'), this.translate.instant(this.selected.typeName)));
        if (!this.selected.delete) {
            const itemTitle: string = this.translate.instant(
                this.selected.innersCount === 1 ? 'deletePhoneMessageSn' : 'deletePhoneMessagePl',
                { phone: this.selected.phoneNumber, extCount: this.selected.innersCount });
            const delItem: SidebarInfoItem = new SidebarInfoItem(8, itemTitle, null, true, false, true);
            this.sidebar.items.push(delItem);
        }
    }

    cancel(): void {
        this.router.navigateByUrl('/cabinet/phone-numbers');
        this.sidebarVisible = false;
        if (!this.editMode ) {
            this.buttons[1].inactive = false;
        }
        this.selected = null;
    }

    toggleNumber(): void {
        this.selected.loading++;
        this.select(this.selected);
        this.service.toggleNumber(this.selected.id, !this.selected.status)
            .then(() => {
                this.list.getItems(this.selected);
                let status: string;
                if (this.selected.status === 0) {
                    status = this.translate.instant('enabled');

                    this.sidebar.buttons[1].title = this.translate.instant('Disable');
                    this.sidebar.items[3].value = this.translate.instant('Enabled');
                }
                if (this.selected.status === 1) {
                    status = this.translate.instant('disabled');
                    this.sidebar.buttons[1].title = this.translate.instant('Enable');
                    this.sidebar.items[3].value = this.translate.instant('Disabled');
                }

                if (this.selected.status === 1) {
                    this.selected.status = 0;
                } else {
                    this.selected.status = 1;
                }

                this.message.writeSuccess(this.translate.instant('The phone number has been') + ' ' + this.translate.instant(status));
            })
            .catch(() => { })
            .then(() => this.selected.loading--);
    }

    clickButton($event) {
        if ($event) {
            switch ($event.id) {
                case 10:
                    this.router.navigate(['cabinet', 'phone-numbers', 'buy']);
                    break;
                case 11:
                    this.addExternalPhoneNumber = true;
                    this.buttons[1].inactive = true;
                    this.sidebar = new SidebarInfoModel();
                    this.sidebar.buttons.push(new SidebarButtonItem(1, this.translate.instant('Cancel'), 'cancel'));
                    this.sidebar.buttons.push(new SidebarButtonItem(2, this.translate.instant('Add'), 'success'));
                    this.router.navigate(['cabinet', 'phone-numbers', 'external']);
                    break;
            }
        }
    }

    click(item) {
        if (item) {
            switch (item.id) {
                case 8:
                    this.list.items.clickDeleteItem(this.selected);
                    break;
                case 1:
                    this.cancel();
                    break;
                case 2:
                    if (!this.editMode && this.selected) {
                        this.toggleNumber();
                    } else {
                        this.save();
                    }
            }
        }
    }

    save() {
        const id: number = this.phoneExternal.id;
        if (this.phoneExternal.id) {
            this.service.putById(this.phoneExternal.id, this.phoneExternal, true).then(() => {
                this.phoneExternal = new PhoneNumberExternalModel();
                this.selected = null;
                this.router.navigateByUrl('/cabinet/phone-numbers');
                this.sidebarVisible = false;
                this.resetErrors();
                this.service.getById(id).then((response) => {
                    this.list.pageInfo.items.forEach(item => {
                       if (item.id === id) {
                           item.port = response.port;
                           item.host = response.host;
                           item.login = response.login;
                       }
                    });
                }).catch(() => {})
                    .then(() => {});
            }).catch((error) => {
                if (error.errors.port) {
                    this.errors.port = error.errors.port;
                }
                if (error.errors.password) {
                    this.errors.password = error.errors.password;
                }
                if (error.errors.host) {
                    this.errors.host = error.errors.host;
                }
                if (error.errors.phoneNumber) {
                    this.errors.phoneNumber = error.errors.phoneNumber;
                }
                console.log(this.errors);
            }).then(() => {});
        } else {
            this.service.post('', this.phoneExternal, true).then(() => {
                this.phoneExternal = new PhoneNumberExternalModel();
                this.selected = null;
                this.router.navigateByUrl('/cabinet/phone-numbers');
                this.sidebarVisible = false;
                if (!this.editMode) {
                    this.buttons[1].inactive = false;
                }
                this.resetErrors();
            }).catch((error) => {
                if (error.errors.port) {
                    this.errors.port = error.errors.port;
                }
                if (error.errors.password) {
                    this.errors.password = error.errors.password;
                }
                if (error.errors.host) {
                    this.errors.host = error.errors.host;
                }
                if (error.errors.phoneNumber) {
                    this.errors.phoneNumber = error.errors.phoneNumber;
                }
                console.log(this.errors);
            }).then(() => {
            });
        }
    }

    load() {
        this.selected = null;
        this.list.pageInfo.items.forEach(item => {
            if (item.providerId === 10) {
                item.editable = true;
            }
            item.statusName = this.translate.instant(item.statusName);
            item.typeName = this.translate.instant(item.typeName);
        });
    }

    edit(item) {
        this.phoneExternal.id = item.id;
        this.phoneExternal.host = item.host;
        this.phoneExternal.port = item.port;
        this.phoneExternal.login = item.login;
        this.phoneExternal.phoneNumber = item.phoneNumber;
        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, this.translate.instant('Cancel'), 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, this.translate.instant('Save'), 'success'));
        this.sidebar.items = [];
        this.sidebarVisible = true;
        this.addExternalPhoneNumber = true;
        this.editMode = true;
    }

    onDelete(item: any): void {
        const deleteConfirmationMsg: string = this.translate.instant(
            item.sipInners.length === 1 ? 'deletePhoneConfirmationSn' : 'deletePhoneConfirmationPl',
            { phone: item.phoneNumber, extCount: item.sipInners.length });

        this.message.writeSuccess(deleteConfirmationMsg);
    }

    ngOnInit() {
        if (this.router.url === '/cabinet/phone-numbers/external') {
            this.sidebar.buttons = [];
            this.sidebar.buttons.push(new SidebarButtonItem(1, this.translate.instant('Cancel'), 'cancel'));
            this.sidebar.buttons.push(new SidebarButtonItem(2, this.translate.instant('Save'), 'success'));
            this.sidebar.items = [];
            this.sidebarVisible = true;
            this.addExternalPhoneNumber = true;
            this.editMode = true;
            this.buttons[1].inactive = true;
        }

        this.router.events.subscribe(route =>  {
            if (route instanceof NavigationEnd) {
                if (this.router.url === '/cabinet/phone-numbers/external') {
                    this.sidebarVisible = true;
                    this.addExternalPhoneNumber = true;
                    this.editMode = true;
                    this.list.buttons[1].inactive = true;
                }
            }
        });
    }
}
