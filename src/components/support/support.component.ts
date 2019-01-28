import {Component, OnInit, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {ButtonItem, FilterItem} from '../../models/base.model';
import {TranslateService} from '@ngx-translate/core';
import {HeaderComponent} from '../../elements/pbx-header/pbx-header.component';
import { SidebarButtonItem, SidebarInfoModel } from '../../models/base.model';
import {MessagesItemModel, SupportModel} from '@models/support.model';
import {SupportService} from '@services/support.service';
import {AddressBookModel} from '@models/address-book.model';
import {PhoneNumberExternalModel} from '@models/phone-number-external.model';

@Component({
    selector: 'support-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('x', '300ms')]
})

export class SupportComponent implements OnInit {
    buttons: ButtonItem[];
    filters: FilterItem[];
    sidebar: SidebarInfoModel = new SidebarInfoModel();
    supportModel: SupportModel;
    shown: boolean = false;
    sidebarVisible: boolean = false;
    createMode: boolean;
    dropdownFilesStatus: boolean = false;
    message: string = '';
    sortingDown: any;
    sort: any;
    currentItemId: any;
    currentItem: any;

    tableHeader: any;

    ticketMessage: MessagesItemModel = new MessagesItemModel();

    @ViewChild(HeaderComponent) header: HeaderComponent;

    constructor(
        public service: SupportService,
        public translate: TranslateService) {
        this.supportModel = new SupportModel();
        this.filters = [];
        this.filters.push(new FilterItem(1, 'search', this.translate.instant('Search'), null, null, this.translate.instant('Ticket or Subject'), 404));
        this.buttons = [];
        this.buttons = [
            {
                id: 0,
                title: 'Add New Ticket',
                type: 'success',
                visible: true,
                inactive: false,
                buttonClass: 'plus',
                icon: ''
            }
        ];
        this.sidebar.buttons = [];
        this.tableHeader = [
            {
                column: 'id',
                title: 'Ticket',
                isDown: true
            },
            {
                column: 'subject',
                title: 'Subject',
                isDown: null
            },
            {
                column: 'updated',
                title: 'Last Updated',
                isDown: null
            },
            {
                column: 'status',
                title: 'Status',
                isDown: null
            },
            {
                column: 'supportUserName',
                title: 'Support',
                isDown: null
            }
        ];
        this.createMode = false;
    }

    showTicket (item: any) {
        this.sidebarVisible = true;
        this.createMode = false;
        this.buttons[0].inactive = false;
        this.sidebar.buttons = [];
        this.currentItemId = item.id;
        this.ticketMessage.supportTicket = item.id;
        this.service.getById(item.id)
            .then(response => {
                console.log(response);
            })
            .catch(() => {})
            .then(() => {});
        for (const j in this.supportModel.items) {
            if (this.supportModel.items[parseInt(j)].id === this.currentItemId) {
                this.currentItem = this.supportModel.items[parseInt(j)];
            }
        }
    }

    sortIcon(item: any): string {
      return item.isDown
        ? '/assets/icons/_middle/sorting_down_16px.svg'
        : '/assets/icons/_middle/sorting_up_16px.svg';
    }

    sortIt (index: number) {
        this.tableHeader[index].isDown = !this.tableHeader[index].isDown;
        for (const i in this.tableHeader) {
            if (parseInt(i) !== index) {
                this.tableHeader[i].isDown = null;
            }
        }
        this.getItems(index);
    }

    dropdownFilesFunc() {
        this.dropdownFilesStatus = !this.dropdownFilesStatus;
    }

    click ($event) {
        if ($event) {
            switch ($event.id) {
                case 0:
                    this.sidebarVisible = true;
                    this.buttons[0].inactive = true;
                    this.createMode = true;
                    this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
                    this.sidebar.buttons.push(new SidebarButtonItem(2, 'Create Ticket', 'success'));
                    break;
                case 1:
                    this.sidebarVisible = false;
                    this.buttons[0].inactive = false;
                    this.createMode = false;
                    this.sidebar.buttons = [];
                    break;
            }
        }
    }

    showDetails() {
        this.shown = !this.shown;
    }

    getItems (index: number) {
        this.service.getItems(this.supportModel, this.tableHeader[index])
            .then(response => {
                this.supportModel = response;
                console.log(this.supportModel);
                // this.supportModel.limit = limit;
            })
            .catch(() => { })
            .then(() => {} /*item ? item.loading-- :*/ );
    }

    ngOnInit() {
        this.getItems(0);
        this.sidebar.buttons = [];
        if (this.createMode) {
            this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
            this.sidebar.buttons.push(new SidebarButtonItem(2, 'Create Ticket', 'success'));
        }
    }

    saveMessage () {
        this.service.post('/response', this.ticketMessage, true).then(() => {
            // this.phoneExternal = new PhoneNumberExternalModel();
            // this.selected = null;
            // this.router.navigateByUrl('/cabinet/phone-numbers');
            // this.sidebarVisible = false;
            // if (!this.editMode) {
            //     this.buttons[1].inactive = false;
            // }
            // this.resetErrors();
        }).catch((error) => {
            // if (error.errors.port) {
            //     this.errors.port = error.errors.port;
            // }
            // if (error.errors.password) {
            //     this.errors.password = error.errors.password;
            // }
            // if (error.errors.host) {
            //     this.errors.host = error.errors.host;
            // }
            // if (error.errors.phoneNumber) {
            //     this.errors.phoneNumber = error.errors.phoneNumber;
            // }
            // console.log(this.errors);
        }).then(() => {
        });
    }


}
