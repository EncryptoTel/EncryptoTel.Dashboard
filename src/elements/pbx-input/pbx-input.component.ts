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
    @Input() form: boolean;
    @Input() formKey: string;
    @Input() index: number;

    @Output() onSelect: EventEmitter<object> = new EventEmitter();
    @Output() onToggle: EventEmitter<object> = new EventEmitter();
    @Output() onKeyUp: EventEmitter<object> = new EventEmitter();

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

    checkError(textOnly = null): string {
        if (!this.errors) {
            return textOnly ? null : this.checkForm();
        }
        return (this.errors && this.errors[this.getErrorKey()]) || (textOnly ? null : this.checkForm());
    }

    getFormKey() {
        return this.formKey ? this.formKey : this.key;
    }

    getForm() {
        if (this.index !== undefined) {
            return this.object.get([this.index, this.getFormKey()]);
        } else {
            return this.object.get(this.getFormKey());
        }
    }

    checkForm() {
        if (!this.form) {
            return null;
        }
        let form = this.getForm();
        return form && form.touched && form.invalid;
    }

    resetError() {
        if (this.checkError()) {
            this.errors ? this.errors[this.getErrorKey()] = null : null;
            if (this.form) {
                let form = this.getForm();
                form.markAsUntouched();
            }
        }
    }

    inputKeyUp($event) {
        this.resetError();
        this.object[this.key] = $event.target.value;
        this.onKeyUp.emit($event);
    }

    selectItem($event) {
        this.resetError();
        if (this.form) {
            this.value = $event;
            // this.objectView.id = $event.id;
            // this.objectView[this.displayKey] = $event[this.displayKey];
            this.key ? this.getForm().setValue($event.id) : null;

        } else {
            this.object[this.key] = $event.id;
            this.value[this.displayKey] = $event[this.displayKey];
        }
        this.onSelect.emit($event);
    }

    toggleCheckbox($event) {
        if (this.form) {
            this.getForm() ? this.getForm().setValue($event) : null;
        } else {
            this.object[this.key] = this.checkboxValues[$event ? 1 : 0];
        }
        this.onToggle.emit($event);
    }

    ngOnInit() {
        if (this.form && this.checkbox) {
            this.value = this.getForm() ? this.getForm().value : false;
        } else if (this.options) {
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
