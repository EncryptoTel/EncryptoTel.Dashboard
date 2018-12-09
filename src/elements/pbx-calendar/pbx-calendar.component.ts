import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';

import {week} from '@shared/vars';
import {SwipeAnimation} from '@shared/swipe-animation';


@Component({
  selector: 'pbx-calendar',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '200ms')]
})
export class CalendarComponent implements OnInit, OnChanges {
    today: Date;
    goEnd: boolean;
    week: string[];
    month: string[];

    index = [0, 1];
    title: string[] = [];
    pick: Date[] = [];
    view: Date[] = [];
    array: [number[]] = [[]];
    type: [string[]] = [[]];
    showWrap: boolean;
    pick_start = true;
    monthActive = [true, true];
    checkbox = false;
    before: string[] = [];

    @Input() isSetting: boolean;
    @Input() split = '.' || '-' || '/';
    @Input() dates: string[];
    
    @Output() newDates: EventEmitter<string[]> = new EventEmitter<string[]>();

    // -- component lifecycle methods -----------------------------------------

    constructor() {
        this.today = new Date();
        this.goEnd = false;
        this.week = week;
        this.month = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    }

    ngOnInit(): void {
        this.initCalendar();
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dates && changes.dates.currentValue) {
            this.initCalendar();
        }
    }

    initCalendar(): void {
        if (!this.dates || this.dates.length !== 2) {
            this.dates = [];
            this.dates.push(this.dateToString(this.isSetting ? this.today : new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 13)));
            this.dates.push(this.dateToString(!this.isSetting ? this.today : new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1)));
        }

        this.title = [];
        this.pick = [];
        this.view = [];
        this.array = [[]];
        this.type = [[]];
        this.before = [];

        this.index.forEach(i => {
            this.title.push(this.dates[i]);
            this.pick.push(this.stringToDate(this.dates[i], i));
            this.view.push(this.stringToDate(this.dates[i], i));
            this.array.push([]);
            this.type.push([]);
            this.before.push();
        });
    }

    // -- event handlers ------------------------------------------------------

    apply(): void {
        if (this.showWrap) {
            if (!(this.title[0] === this.before[0] && this.title[1] === this.before[1])) {
                this.newDates.emit(this.title); 
            }
            this.showWrap = false;
            this.goEnd = false;
        }
    }

    // -- component methods ---------------------------------------------------

    stringToDate(text: string, index): Date {
        const a = text.split(this.split);
        this.checkbox = a.length === 2;
        return new Date(+a[2] || (this.today.getFullYear() + (index === 1 && text === `01${this.split}01` ? 1 : 0)), +a[1] - 1, +a[0]);
    }

    dateToString(date: Date, periodic = false): string {
        return (date.getDate() < 10 ? '0' : '') + date.getDate() + this.split + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + (periodic ? '' : this.split + date.getFullYear());
    }

    countOfDays(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    datesIsEqual(a: Date, b: Date): boolean {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    fillArray(index: number): void {
        this.view[index].setDate(1);
        const total = this.countOfDays(this.view[index]);
        this.array[index] = [];
        this.type[index] = [];
        for (let i = this.view[index].getUTCDay(); i > 0; i--) {
            this.array[index].push(null);
            this.type[index].push('block');
        }
        for (let i = 1; i <= total; i++) {
            this.view[index].setDate(i);
            this.array[index].push(i);
            let type = 'able';
            if (!this.isSetting && this.view[index] > this.today) {
                type = 'block'; 
            }
            if (this.pick[0] < this.view[index] && this.view[index] < this.pick[1]) {
                type = 'mid'; 
            }
            if (this.datesIsEqual(this.view[index], this.pick[0]) || this.datesIsEqual(this.view[index], this.pick[1])) {
                type = 'pick'; 
            }
            this.type[index].push(type);
        }
        if (index === 1) {
            this.monthActive[1] = this.isSetting || !(this.view[1].getFullYear() === this.today.getFullYear() && this.view[1].getMonth() === this.today.getMonth()); 
        }
    }

    clickMonth(value: number) {
        if (this.monthActive[value]) {
            this.index.forEach(i => {
                this.view[i].setFullYear(this.view[i].getFullYear(), this.view[i].getMonth() + value * 2 - 1, 1); 
            });
            this.index.forEach(i => { this.fillArray(i); });
        }
    }

    clickDay(index: number, value: number, type: string): void {
        if (type !== 'block') {
            const n = (this.pick_start = !this.pick_start) ? 1 : 0;
            this.pick[n].setFullYear(this.view[index].getFullYear(), this.view[index].getMonth(), value);
            if (this.pick[0] > this.pick[1]) {
                this.pick[1 - n].setFullYear(this.pick[n].getFullYear(), this.pick[n].getMonth(), value);
                this.pick_start = false;
            }
            this.index.forEach(i => {
                this.fillArray(i);
                this.title[i] = this.dateToString(this.pick[i], this.checkbox);
            });
        }
    }

    clickCheckbox() {
        this.checkbox = !this.checkbox;
        this.index.forEach(i => {
            this.title[i] = this.dateToString(this.pick[i], this.checkbox); });
    }

    openCalendar(): void {
        if (this.showWrap = !this.showWrap) {
            if (!this.goEnd && this.pick[0].getFullYear() === this.today.getFullYear() && this.pick[0].getMonth() === this.today.getMonth()) {
                this.goEnd = true; 
            }
            const n = this.goEnd ? 1 : 0;
            this.index.forEach(i => {
                this.before[i] = this.title[i];
                this.view[i].setFullYear(this.pick[n].getFullYear(), this.pick[n].getMonth() + i - n, 1);
                this.fillArray(i);
            });
            this.pick_start = true;
        }
        else {
            this.apply(); 
        }
    }

    resetCalendar(): void {
        this.index.forEach(i => {
            this.pick[i].setFullYear(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + (i - 1) * 13);
            this.title[i] = this.dateToString(this.pick[i]); });
        this.apply();
    }
}
