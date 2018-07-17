import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {BaseItemModel, PageInfoModel} from "../../models/base.model";
import {ButtonItem} from "../pbx-header/pbx-header.component";
import {Router} from "@angular/router";
import {CallRulesItem} from "../../models/call-rules.model";

@Component({
    selector: 'pbx-list',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})

export class ListComponent implements OnInit{
    @Input() name: string;
    @Input() key: string;
    @Input() pageInfo: PageInfoModel;
    @Input() table: any;
    @Input() service: any;
    @Input() buttonTitle: string;
    @Input() loading: boolean;
    @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEdit: EventEmitter<object> = new EventEmitter<object>();
    @Output() onSelect: EventEmitter<object> = new EventEmitter<object>();
    @Output() onLoad: EventEmitter<object> = new EventEmitter<object>();

    buttons: ButtonItem[] = [];
    loadingEx: number = 0;

    constructor(private router: Router) {

    }

    create() {
        if (this.onCreate.observers.length > 0) {
            this.onCreate.emit();
        } else {
            this.router.navigate(['cabinet', this.key, 'create']);
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

    delete(item: CallRulesItem) {
        item.loading++;
        this.service.deleteById(item.id).then(() => {
            this.getItems(item);
            item.loading--;
        }).catch(err => {
            item.loading--;
        });
    }

    getItems(item = null) {
        item ? item.loading++ : this.loadingEx++;
        this.service.getItems(this.pageInfo).then(res => {
            this.pageInfo = res;
            this.onLoad.emit(this.pageInfo);
            item ? item.loading-- : this.loadingEx--;
        }).catch(err => {
            item ? item.loading-- : this.loadingEx--;
        });
    }

    ngOnInit() {
        this.buttons.push({
            id: 0,
            title: this.buttonTitle ? this.buttonTitle : 'Create ' + this.name,
            type: 'success',
        });
        this.getItems();
    }

}