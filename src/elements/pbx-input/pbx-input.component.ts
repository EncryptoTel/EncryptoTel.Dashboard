import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
    selector: 'pbx-input',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class InputComponent implements OnInit {
    @Input() key: string;
    @Input() name: string;
    @Input() description: string;
    @Input() inputClass: string;
    @Input() type: string;
    @Input() placeholder: string;
    @Input() object: any;
    @Input() errorKey: string;
    @Input() errors: any;
    @Input() objectView: any;
    @Input() options: any[];
    @Input() displayKey: string;
    @Input() checkbox: boolean;
    @Input() trueValue: any;
    @Input() falseValue: any;

    @Output() onSelect: EventEmitter<object> = new EventEmitter();
    @Output() onToggle: EventEmitter<object> = new EventEmitter();

    value;
    checkboxValues;

    constructor() {
        if (!this.type) this.type = 'text';
        if (!this.placeholder) this.placeholder = '';
        if (!this.inputClass) this.inputClass = '';
    }

    getErrorKey() {
        return this.errorKey ? this.errorKey : this.key;
    }

    checkError(): string {
        if (!this.errors) {
            return null;
        }
        return this.errors && this.errors[this.getErrorKey()];
    }

    resetError() {
        if (this.checkError()) {
            this.errors[this.getErrorKey()] = null;
        }
    }

    onKeyUp($event) {
        this.resetError();
        this.object[this.key] = $event.target.value;
    }

    selectItem($event) {
        this.resetError();
        this.object[this.key] = $event.id;
        this.value[this.displayKey] = $event[this.displayKey];
        this.onSelect.emit($event);
    }

    toggleCheckbox($event) {
        this.object[this.key] = this.checkboxValues[$event ? 1 : 0];
        this.onToggle.emit($event);
    }

    ngOnInit() {
        if (this.options) {
            this.value = this.objectView ? this.objectView : this.object;
        } else {
            this.value = this.object[this.key];
        }

        this.checkboxValues = [
            this.falseValue ? this.falseValue : false,
            this.trueValue ? this.trueValue : true
        ];
    }

}
