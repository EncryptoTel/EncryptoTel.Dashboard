import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    ViewChildren
} from '@angular/core';

import { InputComponent } from '@elements/pbx-input/pbx-input.component';
import { ButtonItem, FilterItem } from '@models/base.model';


@Component({
    selector: 'pbx-header',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})
export class HeaderComponent implements OnInit {
    currentFilter;
    selectedFilter;

    @Input() buttons: ButtonItem[];
    @Input() filters: FilterItem[];
    @Input() inactive: boolean;
    @Input() errors: any;

    @Output() onClick: EventEmitter<ButtonItem>;
    @Output() onReload: EventEmitter<any>;
    @Output() onUpdate: EventEmitter<any>;

    @ViewChildren(InputComponent) inputs: QueryList<InputComponent>;

    // -- component lifecycle methods -----------------------------------------

    constructor() {
        this.filters = [];
        this.currentFilter = [];
        this.selectedFilter = [];

        this.onClick = new EventEmitter<ButtonItem>();
        this.onReload = new EventEmitter<any>();
        this.onUpdate = new EventEmitter<any>();
    }

    ngOnInit() {}

    // -- properties ----------------------------------------------------------

    activeButtons(): ButtonItem[] {
        return this.buttons.filter(b => b.visible);
    }

    activeFilter(): FilterItem[] {
        return this.filters ? this.filters.filter(item => !item.hidden) : null;
    }

    // -- event handlers ------------------------------------------------------

    load(): void {
        Object.keys(this.currentFilter).forEach(key => {
            if (!this.currentFilter[key]) this.currentFilter[key] = null;
        });
        this.onUpdate.emit(this.currentFilter);
    }

    reload(): void {
        this.onReload.emit(this.currentFilter);
    }

    updateFilter(index: number, filter): void {
        this.selectedFilter[index] = filter;
        const item = this.inputs.find((i, idx) => idx === index);
        if (item) item.value = filter;
    }

    clickButton(item: ButtonItem): void {
        this.onClick.emit(item);
    }
}
