import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {FormArray, FormGroup} from "@angular/forms";
import {SwipeAnimation} from "../../shared/swipe-animation";

@Component({
    selector: 'pbx-input',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms'), SwipeAnimation('y', '200ms')]
})

export class InputComponent implements OnInit {
    @Input() key: string;
    @Input() name: string;
    @Input() description: string;
    @Input() descriptionClass: string;
    @Input() inputClass: string = '';
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
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
    @Input() index2: number;
    @Input() updateValueByKey: boolean;
    @Input() updateObjectByObject: boolean;
    @Input() labelPosition: string;
    @Input() singleBorder: boolean = true;
    @Input() floatError: boolean = false;
    @Input() errorVisible: boolean = false;
    @Input() rows: number = 5;

    @Output() onSelect: EventEmitter<object> = new EventEmitter();
    @Output() onToggle: EventEmitter<object> = new EventEmitter();
    @Output() onKeyUp: EventEmitter<object> = new EventEmitter();

    // @ViewChild('errorSpan') errorSpan: ElementRef;
    @ViewChild('inputDiv') inputDiv: ElementRef;

    value;
    checkboxValues;
    prevError;
    prevFormError;
    hoverActive = false;

    constructor() {

    }

    setFocus(): void {
        // if (this.checkError()) {
            // this.errorSpan.nativeElement.focus();
        this.errorVisible = true;
        // }
    }

    removeFocus(): void {
        // if (this.checkError()) {
            // this.errorSpan.nativeElement.blur();
        this.errorVisible = false;
        // }
    }


    getErrorKey() {
        return this.errorKey ? this.errorKey : this.key;
    }

    getValueByKey(item: any, key: string) {
        if (!key) {
            return null;
        }
        const keyArray = key.split('.');
        keyArray.forEach(k => item = item && item[k]);
        return item;
    }

    setError(value) {
        let key = this.getErrorKey();
        if (!key) {
            return null;
        }
        this.errors[key] = value;
        // const keyArray = key.split('.');
        // keyArray.forEach(k => item = item && item[k]);
        // item = null;
    }

    checkError(textOnly = null): string {
        if (!this.errors) {
            return this.checkForm(textOnly);
        }
        let error = this.errors && this.getValueByKey(this.errors, this.getErrorKey());
        let result = (this.errors && (textOnly ? (error !== true ? error : null) : error)) || (textOnly ? null : this.checkForm(textOnly));
        return result;
    }

    getFormKey() {
        return this.formKey ? this.formKey : this.key;
    }

    getForm() {
        if (this.index !== undefined) {
            return this.object.get([this.index, this.getFormKey()]);
        } else if (this.index2 !== undefined) {
            return this.object.get([this.getFormKey(), this.index2]);
        } else {
            return this.object.get(this.getFormKey());
        }
    }

    checkForm(textOnly = null) {
        if (!this.form) {
            return null;
        }
        let form = this.getForm();
        if (textOnly) {
            if (form && form.touched && form.invalid && form.errors) {
                let keys = Object.keys(form.errors);
                for (let i = 0; i < keys.length; i++) {
                    switch (keys[i]) {
                        case 'required':
                            return 'This value is required';
                        case 'maxlength':
                            return 'This value is too long';
                        default:
                            // console.log(keys[i]);
                            return 'This value is invalid';
                    }
                }
            }
            return null;
        }
        return form && form.touched && form.invalid;
    }

    resetError() {
        if (this.checkError()) {
            this.errors ? this.setError(null) : null;
            if (this.form) {
                let form = this.getForm();
                form.markAsUntouched();
            }
        }
    }

    inputKeyUp($event) {
        if ($event && !['Tab', 'ArrowRight', 'ArrowLeft'].includes($event.key)) {
            this.resetError();
        }
        // this.resetError();
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
            if (this.updateObjectByObject) {
                this.object[this.key] = $event;
            } else {
                this.object[this.key] = $event.id;
            }
            if (this.updateValueByKey) {
                this.value.id = $event.id;
                this.value[this.displayKey] = $event[this.displayKey];
            } else {
                this.value = $event;
            }
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

    findInput(element) {
        if (!element) {
            return null;
        }
        if (element.children) {
            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i].localName === 'input') {
                    element.children[i].focus();
                } else {
                    this.findInput(element.children[i]);
                }
            }
        }
    }

    checkControlError(errors, key) {
        let keys = Object.keys(errors);
        if (keys.length > 0) {
            if (keys[0] === key) {
                this.inputDiv ? this.findInput(this.inputDiv.nativeElement) : null;
                this.errorVisible = true;
            }
        }
    }

    getErrorVisible() {
        if (this.errors) {
            if (this.errors != this.prevError) {
                this.prevError = this.errors;
                this.checkControlError(this.errors, this.getErrorKey());
            }
        }
        if (this.form) {
            let form = this.object;
            let errors = {};
            Object.keys(form.controls).forEach(field => {
                const control = form.get(field);
                if (control instanceof FormArray) {
                    let index = 0;
                    control.controls.forEach((ctrl: FormGroup) => {
                        if (ctrl.errors) {
                            errors[`${field}_${index}`] = ctrl.errors;
                        }
                        index++;
                    });
                } else if (control.errors) {
                    errors[field] = control.errors;
                    // return this.checkControlError(field, control);
                }

            });
            if (JSON.stringify(errors) != this.prevFormError) {
                this.prevFormError = JSON.stringify(errors);
                let key = this.index2 === undefined ? this.getFormKey() : `${this.getFormKey()}_${this.index2}`;
                this.checkControlError(errors, key);
            }
        }
        return this.errorVisible;
    }

    mouseEnter() {
        this.hoverActive = this.floatError;
    }

    mouseLeave() {
        this.hoverActive = false;
    }


    ngOnInit() {
        if (this.form && this.checkbox) {
            this.value = this.getForm() ? this.getForm().value : false;
        } else if (this.options) {
            if (this.updateObjectByObject) {
                this.value = this.object[this.key];
            } else {
                this.value = this.objectView ? this.objectView : this.object;
            }
        } else {
            this.value = this.object[this.key];
        }

        this.checkboxValues = [
            this.falseValue ? this.falseValue : false,
            this.trueValue ? this.trueValue : true
        ];
    }

}
