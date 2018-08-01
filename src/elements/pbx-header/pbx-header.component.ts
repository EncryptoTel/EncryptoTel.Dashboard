import {Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {InputComponent} from "../pbx-input/pbx-input.component";
import {ButtonItem, FilterItem} from "../../models/base.model";

@Component({
    selector: 'pbx-header',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class HeaderComponent implements OnInit {
    @Input() buttons: ButtonItem[];
    @Input() filters: FilterItem[] = [];
    @Input() inactive: boolean;
    @Input() errors: any;
    @Output() onClick: EventEmitter<ButtonItem> = new EventEmitter<ButtonItem>();
    @Output() onReload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();

    @ViewChildren(InputComponent) inputs: QueryList<InputComponent>;

    currentFilter = [];
    private timeout = null;
    selectedFilter = [];

    constructor() {

    }

    clickButton(item: ButtonItem) {
        this.onClick.emit(item);
    }

    reload() {
        if (this.currentFilter['search'].length >= 3 || this.currentFilter['search'].length === 0) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.onReload.emit(this.currentFilter);
            }, 500);
        }
    }

    load() {
        let keys = Object.keys(this.currentFilter);
        for (let i = 0; i < keys.length; i++) {
            if (!this.currentFilter[keys[i]]) {
                this.currentFilter[keys[i]] = null;
            }
        }
        this.onUpdate.emit(this.currentFilter);
    }

    activeButtons() {
        let result = [];
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].visible) {
                result.push(this.buttons[i]);
            }
        }
        return result;
    }

    updateFilter(idx, filter) {
        this.selectedFilter[idx] = filter;
        let item = this.inputs.find((item, index) => {
            return index === idx;
        });
        if (item) item.value = filter;
    }

    activeFilter() {
        return this.filters ? this.filters.filter(item => !item.hidden) : null;
    }

    ngOnInit() {

    }

}
