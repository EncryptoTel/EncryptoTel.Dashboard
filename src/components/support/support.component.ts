import {Component, OnInit, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {ButtonItem, FilterItem} from '../../models/base.model';
import {TranslateService} from '@ngx-translate/core';
import {HeaderComponent} from '../../elements/pbx-header/pbx-header.component';
import { SidebarButtonItem, SidebarInfoModel } from '../../models/base.model';
import {SupportModel} from '@models/support.model';
import {SupportService} from '@services/support.service';
import {AddressBookModel} from '@models/address-book.model';

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
    createMode: boolean = true;
    dropdownFilesStatus: boolean = false;
    message: string = '';
    sortingDown: any;
    sort: any;

    tableHeader: any;

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
                    break;
                case 1:
                    this.sidebarVisible = false;
                    this.buttons[0].inactive = false;
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


}
