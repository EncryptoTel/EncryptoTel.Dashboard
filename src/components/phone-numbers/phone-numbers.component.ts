///<reference path="../../shared/swipe-animation.ts"/>
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PhoneNumberService} from '../../services/phone-number.service';
import {SidebarButtonItem, SidebarInfoItem, SidebarInfoModel, TableInfoModel} from '../../models/base.model';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {Router} from '@angular/router';
import {PhoneNumberItem, PhoneNumberModel} from "../../models/phone-number.model";
import {ListComponent} from "../../elements/pbx-list/pbx-list.component";

@Component({
    selector: 'phone-numbers-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PhoneNumberService],
    animations: [SwipeAnimation('x', '300ms')]
})

export class PhoneNumbersComponent implements OnInit {

    loading: number = 0;

    tableInfo: TableInfoModel = {
        titles: ['Phone Number', 'Amount of phone Exts', 'Default Ext', 'Status', 'Number type'],
        keys: ['phoneNumber', 'innersCount', 'defaultInner', 'statusName', 'typeName']
    };
    selected: PhoneNumberItem;

    pageInfo: PhoneNumberModel = new PhoneNumberModel();
    sidebar: SidebarInfoModel = new SidebarInfoModel();

    @ViewChild('row') row: ElementRef;
    @ViewChild('table') table: ElementRef;
    @ViewChild('button') button: ElementRef;
    @ViewChild(ListComponent) list: ListComponent;

    constructor(public service: PhoneNumberService,
                public router: Router) {
        this.sidebar.title = '';
    }

    // ripple(ev: MouseEvent): void {
    //     if (ev) {
    //         ev.stopPropagation();
    //         ev.preventDefault();
    //     }
    //     const div = document.createElement('div');
    //     const radius = this.button.nativeElement.clientWidth;
    //     div.style.width = div.style.height = radius + 'px';
    //     div.style.top = ev.offsetY - radius / 2 + 'px';
    //     div.style.left = ev.offsetX - radius / 2 + 'px';
    //     div.classList.add('button_overlay');
    //     this.button.nativeElement.appendChild(div);
    //     if (radius < 150) {
    //         div.classList.add('small');
    //         setTimeout(() => {
    //             this.button.nativeElement.removeChild(div);
    //         }, 300);
    //     } else if (radius >= 150 && radius < 300) {
    //         div.classList.add('medium');
    //         setTimeout(() => {
    //             this.button.nativeElement.removeChild(div);
    //         }, 400);
    //     } else {
    //         setTimeout(() => {
    //             this.button.nativeElement.removeChild(div);
    //         }, 550);
    //     }
    // }

    select(item: any): void {
        this.selected = item;
        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Cancel', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, this.selected.status ? 'Disable' : 'Enable', 'accent'));
        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(3, 'Phone number', this.selected.phoneNumber));
        this.sidebar.items.push(new SidebarInfoItem(4, 'Amount of phone Exts', this.selected.innersCount));
        this.sidebar.items.push(new SidebarInfoItem(5, 'Default Ext', this.selected.defaultInner));
        this.sidebar.items.push(new SidebarInfoItem(6, 'Status', this.selected.statusName));
        this.sidebar.items.push(new SidebarInfoItem(7, 'Phone number type', this.selected.typeName));
        this.sidebar.items.push(new SidebarInfoItem(8, 'Delete phone number ' +
            (this.selected.innersCount === 1 ? 'and 1 Ext' : this.selected.innersCount > 1 ? 'and ' + this.selected.innersCount + ' Exts' : ''), null, true, false, true));
    }

    cancel(): void {
        this.selected = null;
    }

    toggleNumber(): void {
        this.selected.loading++;
        this.service.toggleNumber(this.selected.id, !this.selected.status).then(() => {
            this.list.getItems(this.selected);
            this.selected.loading--;
        }).catch(() => {
            this.selected.loading--;
        });
    }

    click(item) {
        switch (item.id) {
            case 8:
                this.list.items.clickDeleteItem(this.selected);
                break;
            case 1:
                this.cancel();
                break;
            case 2:
                this.toggleNumber();
        }
    }

    load() {
        this.selected = null;
    }

    ngOnInit() {

    }
}
