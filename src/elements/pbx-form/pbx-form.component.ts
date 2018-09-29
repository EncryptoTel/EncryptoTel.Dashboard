import {Component, EventEmitter, Input, Output} from '@angular/core';
import {OnInit} from '@angular/core';

@Component({
    selector: 'pbx-form',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class FormComponent implements OnInit {
    
    @Input() tabs: string[];
    @Input() icons: string[];
    @Input() inactiveTabs: boolean[];
    @Input() selected: string;
    @Input() startTab: string;

    @Input() confirm: { value: string, buttonType: string, inactive: boolean, loading: boolean };
    @Input() decline: { value: string, buttonType: string, inactive: boolean, loading: boolean };

    @Input() background: boolean;
    @Input() fillBackground: boolean;

    @Output() onConfirm: EventEmitter<void> = new EventEmitter<void>();
    @Output() onDecline: EventEmitter<void> = new EventEmitter<void>();
    @Output() onSelect: EventEmitter<string> = new EventEmitter<string>();


    // -- event handlers ------------------------------------------------------

    showIcon(index: number): boolean {
        return !!this.icons && index < this.icons.length && !!this.icons[index];
    }

    // -- component lifecycle methods -----------------------------------------

    constructor() {}

    ngOnInit(): void {
        if (this.tabs) {
            !!this.startTab ? this.selected = this.startTab : this.selected = this.tabs[0];
        }
    }

    // -- event handlers ------------------------------------------------------

    selectTab(text: string, index: number) {
        if (!!this.inactiveTabs && this.inactiveTabs[index]) {
            // if (!!this.inactiveTabs && this.inactiveTabs[index]) {
            // this.selected = text;
            this.onSelect.emit(text);
        }
    }

    clickConfirm(): void {
        this.onConfirm.emit();
    }

    clickDecline(): void {
        this.onDecline.emit();
    }
}
