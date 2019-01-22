import {Component, OnInit, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {ButtonItem, FilterItem} from '../../models/base.model';
import {TranslateService} from '@ngx-translate/core';
import {HeaderComponent} from '../../elements/pbx-header/pbx-header.component';
import { SidebarButtonItem, SidebarInfoItem, SidebarInfoModel, TableInfoModel, TableInfoExModel, TableInfoItem } from '../../models/base.model';

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
    shown: boolean = false;
    sidebarVisible: boolean = false;
    createMode: boolean = true;

    @ViewChild(HeaderComponent) header: HeaderComponent;

    constructor(public translate: TranslateService) {
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

    ngOnInit() {
        this.sidebar.buttons = [];
        if (this.createMode) {
            this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
            this.sidebar.buttons.push(new SidebarButtonItem(2, 'Create Ticket', 'success'));
        }
    }


}
