import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {BaseItemModel, PageInfoModel} from "../../models/base.model";
import {ButtonItem, FilterItem, HeaderComponent} from "../pbx-header/pbx-header.component";
import {Router} from "@angular/router";
import {CallRulesItem} from "../../models/call-rules.model";
import {TableComponent} from "../pbx-table/pbx-table.component";

@Component({
    selector: 'pbx-list',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})

export class ListComponent implements OnInit{
    @Input() name: string;
    @Input() itemName: string;
    @Input() key: string;
    @Input() createKey: string = 'create';
    @Input() pageInfo: PageInfoModel;
    @Input() table: any;
    @Input() service: any;
    @Input() buttonTitle: string;
    @Input() loading: boolean;
    @Input() filters: FilterItem;
    @Input() editable: boolean = true;
    @Input() deletable: boolean = true;

    @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEdit: EventEmitter<object> = new EventEmitter<object>();
    @Output() onSelect: EventEmitter<object> = new EventEmitter<object>();
    @Output() onLoad: EventEmitter<object> = new EventEmitter<object>();

    @ViewChild(TableComponent) items;
    @ViewChild(HeaderComponent) header;

    buttons: ButtonItem[] = [];
    currentFilter = [];
    loadingEx: number = 0;
    filter = {loading: 0};

    constructor(private router: Router) {

    }

    create() {
        if (this.onCreate.observers.length > 0) {
            this.onCreate.emit();
        } else {
            this.router.navigate(['cabinet', this.key, this.createKey]);
        }
    }

    edit(item: BaseItemModel) {
        if (this.onEdit.observers.length > 0) {
            this.onEdit.emit(item);
        } else {
            this.router.navigate(['cabinet', this.key, `${item.id}`]);
        }
    }

    select(item: BaseItemModel) {
        if (this.onSelect.observers.length > 0) {
            this.onSelect.emit(item);
        }
    }

    delete(item: BaseItemModel) {
        item.loading++;
        this.service.deleteById(item.id).then(() => {
            this.getItems(item);
            item.loading--;
        }).catch(() => {
            item.loading--;
        });
    }

    getItems(item = null) {
        item ? item.loading++ : this.loadingEx++;
        const limit = this.pageInfo.limit;
        this.service.getItems(this.pageInfo, this.currentFilter).then(res => {
            this.pageInfo = res;
            this.pageInfo.limit = limit;
            this.onLoad.emit(this.pageInfo);
            this.header.load();
            item ? item.loading-- : this.loadingEx--;
        }).catch(() => {
            item ? item.loading-- : this.loadingEx--;
        });
    }

    reloadFilter(filter) {
        this.currentFilter = filter;
        this.getItems(this.filter);
    }

    updateFilter(filter) {
        this.currentFilter = filter;
    }

    activeFilter() {
        let result = 0;
        let keys = Object.keys(this.currentFilter);
        for (let i = 0; i < keys.length; i++) {
            if (this.currentFilter[keys[i]] !== null) {
                result++;
            }
        }
        // console.log(this.currentFilter, result > 0);
        return result > 0;
    }

    ngOnInit() {
        this.buttons.push({
            id: 0,
            title: this.buttonTitle ? this.buttonTitle : 'Create ' + (this.itemName ? this.itemName : this.name),
            type: 'success',
        });
        this.getItems();
    }

}