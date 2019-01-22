import {Component, OnInit, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {ButtonItem, FilterItem} from '../../models/base.model';
import {TranslateService} from '@ngx-translate/core';
import {HeaderComponent} from '../../elements/pbx-header/pbx-header.component';

@Component({
    selector: 'support-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('x', '300ms')]
})

export class SupportComponent implements OnInit {
    buttons: ButtonItem[];
    filters: FilterItem[];
    shown: boolean = false;
    sidebar: boolean = false;
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
    }

    createTicket($event) {
        if ($event) {
            switch ($event.id) {
                case 0:
                    this.sidebar = !this.sidebar;
                    break;
            }
        }
    }

    showDetails() {
        this.shown = !this.shown;
    }

    ngOnInit() {

    }


}
