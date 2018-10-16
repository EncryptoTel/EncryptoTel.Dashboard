import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

import {FadeAnimation} from '../../../shared/fade-animation';
import {IvrTreeItem, IvrLevelItem} from '../../../models/ivr.model';


@Component({
    selector: 'pbx-ivr-level',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class IvrLevelComponent implements OnInit {

    @Input() level: IvrLevelItem;
    @Input() selectedIds: number[];
    @Input() lastLevel: boolean = false;

    @Input() title: string;
    @Input() description: string;

    @Output() ivrDigitSelected: EventEmitter<number> = new EventEmitter<number>();

    // -- properties ----------------------------------------------------------

    get isRoot(): boolean {
        return this.level.number === 0;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor() {
    }

    ngOnInit(): void {
        // console.log('level-node', this.items);
    }

    // -- event handlers ------------------------------------------------------

    selectDigit(itemId: number): void {
        this.ivrDigitSelected.emit(itemId);
    }

    // -- component methods ---------------------------------------------------

    isDigitSelected(itemId: number): boolean {
        return this.selectedIds.indexOf(itemId) !== -1;
    }
}
