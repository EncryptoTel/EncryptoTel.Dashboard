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
    currentTicketIndex: number;
    currentTicketMessages: any;

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

    showTicket (index: any) {
        this.sidebarVisible = true;
        this.createMode = false;
        this.buttons[0].inactive = false;
        this.sidebar.buttons = [];
        this.currentItemId = this.supportModel.items[index].id;
        this.currentTicketIndex = this.supportModel.items[index].id;
        this.ticketMessage.supportTicket = this.supportModel.items[index].id;

        this.getMessages(index);
        for (const j in this.supportModel.items) {
            if (this.supportModel.items[parseInt(j)].id === this.currentItemId) {
                this.currentItem = this.supportModel.items[parseInt(j)];
            }
        }
    }

    getCurrentMessages(id: number) {
        return this.supportModel.items[id].messages;
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

    getMessages (index) {
        let __this: any;
        __this = this;
        let url: string;
        url = '/' + this.supportModel.items[index].id + '/message';
        this.service.get(url).then((response) => {
            __this.supportModel.items[index].messages = [];
            this.currentTicketMessages = [];
            response.items.forEach(_item => {
                let messageItem: any;
                messageItem = new MessagesItemModel();
                messageItem.id = _item.id;
                messageItem.message = _item.message;
                messageItem.supportUserName = _item.supportUserName;
                messageItem.parent = _item.parent;
                messageItem.user = _item.user;
                __this.supportModel.items[index].messages.push(messageItem);
                console.log(__this.supportModel);
            });
            this.currentTicketMessages = this.supportModel.items[index].messages;
        }).catch((error) => {}).then(() => {
        });
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

    sendMessage () {
        this.service.post('/message', this.ticketMessage, true).then(() => {
            console.log(this.ticketMessage.supportTicket);
            let messageItem: any;
            messageItem = new MessagesItemModel();
            messageItem.supportTicket = this.currentTicketIndex;
            messageItem.message = this.ticketMessage.message;
            // messageItem.parent = this.supportModel.items[this.currentTicketIndex].parent;
            messageItem.user = [];

            this.currentTicketMessages.push(messageItem);

            this.ticketMessage.message = '';
            // this.supportModel.items[this.currentTicketIndex].messages.push(messageItem);

            // console.log('supportTicket: ' + this.ticketMessage);
            // console.log(this.ticketMessage.supportTicket);
            // console.log(this.ticketMessage.message);
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
