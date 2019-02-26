import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    HostListener,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { FadeAnimation } from '../../shared/fade-animation';
import { SwipeAnimation } from '../../shared/swipe-animation';
import { FilterItem, InputAction } from '../../models/base.model';
import { ValidationHost } from '../../models/validation-host.model';
import { CheckboxComponent } from '@elements/pbx-checkbox/pbx-checkbox.component';
import { TranslateService } from '@ngx-translate/core';
import { Subscriber } from 'rxjs/Subscriber';
import {isArray} from 'util';

@Component({
    selector: 'pbx-input',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms'), SwipeAnimation('y', '200ms')]
})
export class InputComponent implements OnInit, OnDestroy, OnChanges {

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
    @Input() autocomplete: boolean;
    @Input() displayKey: string;
    @Input() displayCount: string;
    @Input() showCount: boolean;
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
    @Input() required: boolean = false;
    @Input() inputWidth: number;
    @Input() inputCenter: boolean;
    @Input() filter: FilterItem;
    @Input() actions: InputAction[] = [];
    @Input() formBuilder: FormBuilder;
    @Input() animationMode: 'Fade' | 'Swipe';
    @Input() resetable: boolean = false;
    @Input() inputFocus: boolean = false;

    // -- errors redefinitions
    @Input() validatorRequiredMsg: string;
    @Input() validatorMinLengthMsg: string;
    @Input() validatorMaxLengthMsg: string;
    @Input() validatorPatternMsg: string;
    @Input()
    set errorShow(errorShow: boolean) {
        this._errorShow = errorShow;
        this.checkError();
    }
    _errorShow: boolean = false;

    @Input() optionsSelectedKey: string;
    @Input() selectedItem: any;
    @Input() selectAsObject: boolean;
    @Input() validationKey: string;
    @Input() validationHost: ValidationHost;
    @Input() searchStartWith: boolean = false;
    @Input()
    set defaultValue(value: string){
        this._defaultValue = value;
        this.value = this._defaultValue;
    }
    _defaultValue: string = '';

    // Properties to customise validation error message appearing place
    @Input() hVMessageOffset: number;
    @Input() vVMessageOffset: number;
    @Input() showLabel: boolean = true;

    @Output() onSelect: EventEmitter<object> = new EventEmitter();
    @Output() onToggle: EventEmitter<boolean> = new EventEmitter();
    @Output() onKeyUp: EventEmitter<object> = new EventEmitter();
    @Output() onPaste: EventEmitter<object> = new EventEmitter();

    // @ViewChild('errorSpan') errorSpan: ElementRef;
    @ViewChild('inputDiv') inputDiv: ElementRef;
    @ViewChild(CheckboxComponent) checkBox: CheckboxComponent;

    value;
    checkboxValues;
    prevError;
    prevFormError;
    hoverActive = false;
    loading = 0;
    pbxInputFocus = false;
    changeSubscriber: Subscriber<any>;

    // Flags shows component's in focus or mouse over states
    inFocus: boolean = false;
    inMouseHover: boolean = false;


    constructor(public translate: TranslateService) {
    }

    // -- properties ----------------------------------------------------------

    get inErrorState(): boolean {
        if (this.errors) {
            const error = this.getValueByKey(this.errors, this.getErrorKey());
            if (error) return this.checkServerSideError();
        }

        if (this.form) {
            return this.checkFormValidationError();
        }

        return <boolean>this.checkError();
    }

    get isErrorMessageVisible(): boolean {
        if (this.errors) {
            const error = this.getValueByKey(this.errors, this.getErrorKey());
            if (error) return this.checkServerSideError();
        }

        if (this.validationHost) {
            return this.validationHost.isErrorVisible(this);
        }

        return <boolean>this.checkError();
    }

    get errorMessage(): string {
        if (this.errors) {
            const error = this.getValueByKey(this.errors, this.getErrorKey());
            if (error) return error;
        }

        if (this.validationHost) {
            return this.validationHost.getErrorMessage(this);
        }

        return <string>this.checkError(true);
    }

    checkServerSideError(): boolean {
        const error = this.getValueByKey(this.errors, this.getErrorKey());
        return error != null;
    }

    checkFormValidationError(): boolean {
        const control = this.getForm();
        if (control && control.errors) {
            const validationResult = control.errors['required']
                ? !control.valid && control.touched
                : !control.valid && (control.touched || control.dirty);

            return validationResult;
        }
        return false;
    }

    // -- event handlers ------------------------------------------------------

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event) {
        // console.log('scroll', event, this.inputDiv.nativeElement);
    }

    setFocus(): void {
        this.errorVisible = true;
        this.pbxInputFocus = true;

        // --
        this.inFocus = true;

        if (this.validationHost) {
            this.validationHost.updateState();
        }
    }

    removeFocus(): void {
        this.errorVisible = false;
        this.pbxInputFocus = false;

        // --
        if (this.inFocus) {
            this.inFocus = false;
            this.inMouseHover = false;

            if (this.form) {
                const control = this.getForm();
                if (control) {
                    control.markAsTouched();
                }
            }
            if (this.validationHost) {
                this.validationHost.updateState();
            }
        }
    }

    mouseEnter() {
        this.hoverActive = this.floatError;

        // --
        this.inMouseHover = true;

        if (this.validationHost) {
            this.validationHost.updateState();
        }
    }

    mouseLeave() {
        this.hoverActive = false;

        // --
        this.inMouseHover = false;

        if (this.validationHost) {
            this.validationHost.updateState();
        }
    }

    pasteEvent($event: any): void {
        $event.preventDefault();
        const data = $event.clipboardData.getData('Text');
        this.object[this.key] = data;
        this._defaultValue = data;
        this.onPaste.emit($event);
    }

    inputKeyUp($event: any): void {
        if ($event && !['Tab', 'ArrowRight', 'ArrowLeft'].includes($event.key)) {
            this.resetError();
        }
        if (!this.form) {
            this.object[this.key] = $event.target.value;
        }
        this._defaultValue = $event.target.value;
        this.onKeyUp.emit($event);
    }

    // -- ... -----------------------------------------------------------------

    getErrorKey() {
        return this.errorKey ? this.errorKey : this.key;
    }

    getValueByKey(item: any, key: string) {
        if (!key) return null;

        if (item.hasOwnProperty(key)) {
            let result: any = item[key];
            if (isArray(result)) result = result[0];
            return result;
        }

        const keyArray = key.split('.');
        keyArray.forEach(k => (item = item && item[k]));
        return item;
    }

    setError(value): void {
        const key = this.getErrorKey();
        if (!key || !this.errors) return;

        if (this.errors.hasOwnProperty(key)) {
            this.errors[key] = value;
            return;
        }

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

        const error =
            this.errors && this.getValueByKey(this.errors, this.getErrorKey());
        const result =
            (this.errors &&
                (textOnly ? (error !== true ? error : null) : error)) ||
            (textOnly ? null : this.checkForm(textOnly));

        return result;
    }

    getFormKey() {
        return this.formKey || this.key;
    }

    getForm() {
        if (this.index !== undefined) {
            return this.object.get([this.index, this.getFormKey()]);
        }
        else if (this.index2 !== undefined) {
            return this.object.get([this.getFormKey(), this.index2]);
        }
        else {
            return this.object.get(this.getFormKey());
        }
    }

    checkForm(textOnly = null) {
        if (!this.form) {
            return null;
        }

        const form = this.getForm();
        if (textOnly) {
            if (form && form.touched && form.invalid) {
                let keys;
                if (form.errors) {
                    keys = Object.keys(form.errors);
                } else {
                    const control = form.get(this.objectKey);
                    if (control && control.errors) {
                        keys = Object.keys(control.errors);
                    }
                }
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
                return (
                    this.validatorPatternMsg ||
                    'Extension number cannot be the same as previous'
                );
            default:
                return 'This value is invalid';
        }
    }

    resetError() {
        if (this.checkError()) {
            if (this.errors) {
                this.setError(null);
            }
            if (this.form) {
                const form = this.getForm();
                form.markAsUntouched();
            }
        }
    }

    clearValue(): void {
        this.value = this.object[this.key] = null;
        this._defaultValue = this.object[this.key] = null;
        this.onKeyUp.emit();
    }

    selectItem(event: any): void {
        this.resetError();
        if (this.form) {
            this.value = event;
            if (!this.options || !this.selectedItem) {
                if (this.key) {
                    this.getForm().setValue(event);
                }
            }
            if (this.options && this.key) {
                const value = this.selectAsObject ? event : event.id;
                this.getForm().setValue(value);
            }
        } 
        else {
            if (this.updateObjectByObject) {
                this.object[this.key] = event;
            }
            else {
                if (this.object && this.key) {
                    this.object[this.key] = event.id;
                }
            }
            if (this.updateValueByKey) {
                this.value.id = event.id;
                this.value[this.displayKey] = event[this.displayKey];
            }
            else {
                this.value = event;
            }
        }
        this.onSelect.emit(event);
    }

    toggleCheckbox(value: boolean): void {
        const checkValue = this.checkboxValues[value ? 1 : 0];
        if (this.form) {
            if (this.getForm()) {
                this.getForm().setValue(checkValue);
            }
        }
        else {
            this.object[this.key] = checkValue;
        }
        this.onToggle.emit(value);
    }
    checkBoxClick($event) {
        this.checkBox.toggleCheckbox();
    }

    findInput(element) {
        if (!element) {
            return null;
        }
        if (element.children) {
            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i].localName === 'input') {
                    element.children[i].focus();
                }
                else {
                    this.findInput(element.children[i]);
                }
            }
        }
    }

    checkControlError(errors, key) {
        const keys = Object.keys(errors);
        if (keys.length > 0) {
            if (keys[0] === key) {
                if (this.inputDiv) {
                    this.findInput(this.inputDiv.nativeElement);
                }
                this.errorVisible = true;
            }
        }
    }

    getErrorVisible() {
        if (this.errors) {
            if (this.errors !== this.prevError) {
                this.prevError = this.errors;
                this.checkControlError(this.errors, this.getErrorKey());
            }
        }
        if (this.form) {
            const form = this.object;
            const errors = {};
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
                }
            });
            if (JSON.stringify(errors) !== this.prevFormError) {
                this.prevFormError = JSON.stringify(errors);
                const key =
                    this.index2 === undefined
                        ? this.getFormKey()
                        : `${this.getFormKey()}_${this.index2}`;
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
        return (
            !this.animationMode || this.animationMode.toLowerCase() !== 'fade'
        );
    }

    setValue(): void {
        if (this.form) {
            this.value = this.getForm() ? this.getForm().value : false;
            if (this.objectView) {
                this.value = this.objectView;
            }
        }
        else if (this.options) {
            if (this.updateObjectByObject) {
                this.value = this.object[this.key];
            } else {
                this.value = this.objectView ? this.objectView : this.object;
            }
        }
        else {
            this.value = this.object[this.key];
        }

        // when selected option is taken from form it may not be an object but value
        // then the selected value should be matched from options by 'optionsSelectedKey'
        if (this.form && this.options && this.optionsSelectedKey) {
            let selectedValue: any;
            selectedValue = this.getForm().value;
            this.value = this.options.find(
                o => o[this.optionsSelectedKey] === selectedValue
            );
        }
        else if (this.form && this.options && this.selectedItem) {
            this.value = this.selectedItem;
        }
    }

    ngOnInit() {
        if (this.name) {
            this.name = this.translate.instant(this.name);
        }

        this.loading ++;
        if (this.options) {
            this.changeSelectWatch();
        }

        this.setValue();

        this.checkboxValues = [
            this.falseValue ? this.falseValue : false,
            this.trueValue ? this.trueValue : true
        ];

        if (this.validationHost) {
            this.validationHost.addControl(this);
        }

        this.loading --;
    }

    changeSelectWatch() {
        // if (this.form) {
        //     this.getForm().valueChanges.subscribe(val => {
        //         console.log('changeSelectWatch', val, this.value);
        //         this.value = val;
        //         this.selectedItem = val;
        //     });
        // }
    }

    ngOnDestroy(): void {
        // if (this.changeSubscriber) {
        //     this.changeSubscriber.unsubscribe();
        // }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.objectView) {
            this.setValue();
        }
    }
}
