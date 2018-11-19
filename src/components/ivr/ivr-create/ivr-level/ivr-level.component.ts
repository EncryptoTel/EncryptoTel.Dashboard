import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

import {FadeAnimation} from '@shared/fade-animation';
import {IvrTreeItem, IvrLevelItem, IvrLevel, Digit} from '@models/ivr.model';


@Component({
    selector: 'pbx-ivr-level',
    templateUrl: './ivr-level.component.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class IvrLevelComponent implements OnInit {

    @Input() level: IvrLevel;
    @Output() ivrDigitSelected: EventEmitter<Digit> = new EventEmitter<Digit>();
    @Output() ivrLevelSelected: EventEmitter<IvrLevel> = new EventEmitter<IvrLevel>();
    selectedItem: any;

    constructor() {
    }

    ngOnInit(): void {
        this.selectedItem = this.level;
    }

    onSelectDigit(digit: Digit) {
        this.selectedItem = digit;
        this.ivrDigitSelected.emit(digit);
    }

    onSelectLevel() {
        this.selectedItem = this.level;
        this.ivrLevelSelected.emit(this.level);
    }

    addDigit() {
        let d = new Digit();
        this.level.digits.push(d);
        this.onSelectDigit(d);
    }

    
}
