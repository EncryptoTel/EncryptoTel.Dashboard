import {Component, Input, OnInit} from '@angular/core';
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

    buttons: ButtonItem[] = [];
    loading: number = 0;

    constructor(private router: Router) {

    }

    create() {
        this.router.navigate(['cabinet', this.key, 'create']);
    }

    edit(item: BaseItemModel) {
        this.router.navigate(['cabinet', this.key, `${item.id}`]);
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
        item ? item.loading++ : this.loading++;
        this.service.getItems(this.pageInfo).then(res => {
            this.pageInfo = res;
            item ? item.loading-- : this.loading--;
        }).catch(err => {
            item ? item.loading-- : this.loading--;
        });
    }

    ngOnInit() {
        this.buttons.push({
            id: 0,
            title: 'Create ' + this.name,
            type: 'success',
        });
        this.getItems();
    }

}