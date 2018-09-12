import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {SwipeAnimation} from "../../shared/swipe-animation";
import {FilterItem, InputAction} from "../../models/base.model";
import {ValidationHost} from '../../models/validation-host.model';

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
    @Input() disabled: boolean;
    @Input() inputClass: string = '';
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() object: any;
    @Input() errorKey: string;
    @Input() errors: any;
    @Input() objectKey: any;
    @Input() objectView: any;
    @Input() options: any[];
    @Input() editable: boolean;
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
    @Input() required: boolean;
    @Input() inputWidth: number;
    @Input() inputCenter: boolean;
    @Input() filter: FilterItem;
    @Input() actions: InputAction[] = [];
    @Input() formBuilder: FormBuilder;
    @Input() animationMode: string; // Possible values: Fade, Swipe (default)
    @Input() resetable: boolean = false;
    @Input() inputFocus: boolean = false;

    // -- errors redefinitions
    @Input() validatorRequiredMsg: string;
    @Input() validatorMinLengthMsg: string;
    @Input() validatorMaxLengthMsg: string;
    @Input() validatorPatternMsg: string;
    @Input()
    set errorShow(errorShow:boolean) {
        this._errorShow = errorShow;
        this.checkError();
    }
    _errorShow: boolean = false;

    @Output() onSelect: EventEmitter<object> = new EventEmitter();
    @Output() onToggle: EventEmitter<object> = new EventEmitter();
    @Output() onKeyUp: EventEmitter<object> = new EventEmitter();
    @Output() onPaste: EventEmitter<object> = new EventEmitter();

    // @ViewChild('errorSpan') errorSpan: ElementRef;
    @ViewChild('inputDiv') inputDiv: ElementRef;

    @Input() validationHost: ValidationHost;

    value;
    checkboxValues;
    prevError;
    prevFormError;
    hoverActive = false;
    loading = 0;
    pbxInputFocus = false;

    inFocus: boolean = false;
    inMouseHover: boolean = false;

    constructor() {}

    // -- properties ----------------------------------------------------------

    get inErrorState(): boolean {
        if (this.errors) {
            return this.checkServerSideError();
        }

        if (this.form) {
            return this.checkFormValidationError();
        }
        
        return <boolean>this.checkError();
    }

    get isErrorMessageVisible(): boolean {
        if (this.errors) {
            return this.checkServerSideError();
        }

        if (this.validationHost) {
            return this.validationHost.isErrorVisible(this);
        }
        
        return <boolean>this.checkError();;
    }

    get errorMessage(): string {
        if (this.errors) {
            let error = this.getValueByKey(this.errors, this.getErrorKey());
            return error;
        }

        if (this.validationHost) {
            return this.validationHost.getErrorMessage(this);
        }
        
        return <string>this.checkError(true);
    }

    checkServerSideError(): boolean {
        let error = this.getValueByKey(this.errors, this.getErrorKey());
        return error != undefined;
    }

    checkFormValidationError(): boolean {
        let control = this.getForm();
        if (control && control.errors) {
            if (control.errors['required'])
                return !control.valid && control.touched;
            else
                return !control.valid && (control.touched || control.dirty);
        }
        return false;
    }
    
    // -- event handlers ------------------------------------------------------

    setFocus(): void {
        this.errorVisible = true;
        this.pbxInputFocus = true;
        
        // --
        this.inFocus = true;

        if (this.validationHost) 
            this.validationHost.updateState();
    }

    removeFocus(): void {
        this.errorVisible = false;
        this.pbxInputFocus = false;

        // --
        this.inFocus = false;
        this.inMouseHover = false;

        if (this.form) {
            let control = this.getForm();
            if (control) control.markAsTouched();
        }
        if (this.validationHost) 
            this.validationHost.updateState();
    }

    mouseEnter() {
        this.hoverActive = this.floatError;

        // --
        this.inMouseHover = true;

        if (this.validationHost)
            this.validationHost.updateState();
    }

    mouseLeave() {
        this.hoverActive = false;
        
        // --
        this.inMouseHover = false;

        if (this.validationHost)
            this.validationHost.updateState();
    }

    pasteEvent($event: any): void {
        this.onPaste.emit($event);
    }

    inputKeyUp($event) {
        if ($event && ![ 'Tab', 'ArrowRight', 'ArrowLeft' ].includes($event.key)) {
            this.resetError();
        }
        // this.resetError();

        this.object[this.key] = $event.target.value;
        this.onKeyUp.emit($event);
    }

    // -- ... -----------------------------------------------------------------

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
//        this.errors[key] = value;
        const keys = key.split('.');
        switch (keys.length) {
            case 1:
                this.errors[keys[0]] = value;
                break;
            case 2:
                this.errors[keys[0]][keys[1]] = value;
                break;
            case 3:
                this.errors[keys[0]][keys[1]][keys[2]] = value;
                break;
        }
    }

    checkError(textOnly = null): string | boolean {
        if (!this.errors) {
            return this._errorShow ? this.checkForm(textOnly) : '';
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
        if (!this.form) return null;

        let form = this.getForm();
        if (textOnly) {
            if (form && form.touched && form.invalid) {
                let keys;
                if (form.errors) keys = Object.keys(form.errors);
                else {
                    let control = form.get(this.objectKey);
                    if (control && control.errors)
                        keys = Object.keys(control.errors);
                }
                // TODO: map validation result for multiple errors
                return this.getValidatorMessage(keys[0]);
            }
            return null;
        }

        return form && form.touched && form.invalid;
    }

    getValidatorMessage(errorKey: string): string {
        switch (errorKey) {
            case 'required':
                return this.validatorRequiredMsg || 'This value is required';
            case 'minlength':
                return this.validatorMinLengthMsg || 'This value is too short';
            case 'maxlength':
                return this.validatorMaxLengthMsg || 'This value is too long';
            case 'pattern':
                return this.validatorPatternMsg || 'This value is invalid';
            case 'duplicated':
                return this.validatorPatternMsg || 'Extension number cannot be the same as previous';
            default:
                return 'This value is invalid';
        }
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

    clearValue(): void {
        this.value = this.object[this.key] = null;
        this.onKeyUp.emit();
    }

    selectItem(event: any): void {
        this.resetError();
        if (this.form) {
            this.value = event;
            // this.objectView.id = $event.id;
            // this.objectView[this.displayKey] = $event[this.displayKey];
            this.key ? this.getForm().setValue(event) : null;
        } else {
            if (this.updateObjectByObject) {
                this.object[this.key] = event;
            } else {
                this.object[this.key] = event.id;
            }
            if (this.updateValueByKey) {
                this.value.id = event.id;
                this.value[this.displayKey] = event[this.displayKey];
            } else {
                this.value = event;
            }
        }
        this.onSelect.emit(event);
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

    actionAdd(action: InputAction) {
        if (this.formBuilder) {
            action.objects.push(this.formBuilder.control('', []));
        }
    }

    actionDelete(action: InputAction, index: number) {
        if (this.formBuilder) {
            action.objects.removeAt(index);
        }
    }

    isSwipeAnimation(): boolean {
        return !this.animationMode || this.animationMode.toLowerCase() != 'fade';
    }

    ngOnInit() {
        this.loading ++;

        if (this.form && this.checkbox) {
            this.value = this.getForm() ? this.getForm().value : false;
        }
        else if (this.options) {
            if (this.updateObjectByObject) {
                this.value = this.object[this.key];
            }
            else {
                this.value = this.objectView ? this.objectView : this.object;
            }
        }
        else {
            this.value = this.object[this.key];
        }

        this.checkboxValues = [
            this.falseValue ? this.falseValue : false,
            this.trueValue ? this.trueValue : true
        ];

        this.loading --;
        // console.log(this.key, JSON.stringify(this.value));

        this.validationHost && this.validationHost.addControl(this);
    }

}
