import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
    selector: 'pbx-header',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})

export class HeaderComponent implements OnInit {
    @Input() buttons: ButtonItem[];
    @Input() filters: FilterItem[] = [];
    @Input() inactive: boolean;
    @Output() onClick: EventEmitter<ButtonItem> = new EventEmitter<ButtonItem>();
    @Output() onReload: EventEmitter<any> = new EventEmitter<any>();

    currentFilter = [];
    private timeout = null;

    clickButton(item: ButtonItem) {
        this.onClick.emit(item);
    }

    reload() {
        // console.log(this.currentFilter);
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.onReload.emit(this.currentFilter);
        }, 500);
    }

    ngOnInit() {

    }

}

export class ButtonItem {
    id: number;
    title: string;
    type: string;
}

export class FilterItem {
    id: number;
    key: string;
    name: string;
    options: any[];
    optionsDisplayKey: string;
    placeHolder: string;

    constructor(id?: number, key?: string, name?: string, options?: any[], optionsDisplayKey?: string, placeHolder?: string) {
        this.id = id;
        this.key = key;
        this.name = name
        this.options = options;
        this.optionsDisplayKey = optionsDisplayKey;
        this.placeHolder = placeHolder;
    }
}