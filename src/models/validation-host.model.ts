import { FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { InputComponent } from '@elements/pbx-input/pbx-input.component';
import { Lockable, Locker } from './locker.model';


export class ValidationHost implements Lockable {
    locker: Locker;
    active: boolean;
    monitors: Subscription[];

    forms: FormGroup[];
    items: ValidationHostItem[];

    selectedControl: string;
    controls: InputComponent[];

    customMessages: any[] = [];

    // -- component lifecycle methods -----------------------------------------

    constructor(public translate: TranslateService) {
        this.forms = [];
        this.controls = [];

        this.locker = new Locker();
        this.active = false;
        this.monitors = [];
    }

    addForm(form: FormGroup): void {
        this.forms.push(form);
        this.initItems();
        const monitor = form.statusChanges.subscribe(state => this.checkForm(state));
        this.monitors.push(monitor);
    }

    addControl(control: InputComponent): void {
        this.controls.push(control);
    }

    initItems(): void {
        this.items = [];
        this.forms.forEach(form => {
            this.scanForm(form, '', (control, name) => {
                if (control.validator) {
                    this.items.push(new ValidationHostItem(name));
                }
            });
        });
        // console.log('vh-items', this.items);
    }

    // -- public methods ------------------------------------------------------

    start(): void {
        this.active = true;
        if (!this.items && this.forms.length > 0) {
            this.initItems();
        }
    }

    stop(): void {
        this.active = false;
    }

    isErrorVisible(control: InputComponent): boolean {
        const controlKey = this.getValidatorKey(control);
        let item;
        if (this.items) item = this.items.find(i => i.key === controlKey);
        // if (controlKey === 'outer') console.log('err-visible', control.inErrorState, item);
        return control.inErrorState && item && item.visible;
    }

    updateState(): void {
        if (!this.active) { return; }

        const mouseIsInForm = false;
        // let control = this.controls.find(c => c.inMouseHover);
        // if (control) {
        //     mouseIsInForm = true;
        //     if (control.inErrorState) {
        //         this.setControlError(control);
        //         return;
        //     }
        // }

        let inputIsInForm = false;
        const control = this.controls.find(c => c.inFocus);
        if (control) {
            inputIsInForm = true;
            if (control.inErrorState) {
                this.setControlError(control);
                return;
            }
        }

        if (!mouseIsInForm && !inputIsInForm) {
            const controlKey = this.takeFirstInvalidControl();
            this.setErrorVisible(controlKey);
        }
        else {
            this.clearErrorsVisibility();
        }
    }

    findByValidationKey(validationKey: string): InputComponent {
        const control = this.controls.find(c => this.getValidatorKey(c) === validationKey);
        return control;
    }

    clearControlsFocusedState(): void {
        this.controls.forEach(control => control.inFocus = false);
        this.updateState();
    }

    setControlError(control: InputComponent): void {
        const controlKey = this.getValidatorKey(control);
        this.setErrorVisible(controlKey);
    }

    clearErrorsVisibility(): void {
        this.items.forEach(item => item.visible = false);
    }

    setErrorVisible(controlKey: string): void {
        if (controlKey !== this.selectedControl || !this.items.find(item => item.visible)) {
            this.selectedControl = controlKey;

            this.clearErrorsVisibility();

            this.locker.lock();
            setTimeout(() => {
                this.locker.unlock();
                if (this.locker.free) {
                    const item = this.items.find(i => i.key === controlKey);
                    if (item) item.visible = true;
                }
            }, 300);
        }
    }

    // -- common methods ------------------------------------------------------

    checkForm(state: any): void {
        if (state === 'INVALID') this.updateState();
    }

    getErrorMessage(control: InputComponent): string {
        const controlKey = this.getValidatorKey(control);
        let errorMessage = null;
        // console.log('get-error-msg', controlKey);
        this.forms.forEach(form => {
            this.scanForm(form, '', (formControl, name) => {
                if (name === controlKey) {
                    const errorKeys = Object.keys(formControl.errors);
                    // console.log('scan-form', controlKey, errorKeys[0], formControl.errors);
                    errorMessage = this.getValidatorMessage(control, errorKeys[0], formControl.errors);
                }
            });
        });
        return errorMessage;
    }

    takeFirstInvalidControl(): string {
        let firstInvalidControl = null;
        this.forms.forEach(form => {
            this.scanForm(form, '', (control, name) => {
                if (!control.valid && control.errors && control.touched && !firstInvalidControl) {
                    firstInvalidControl = name;
                }
            });
        });
        return firstInvalidControl;
    }

    getFirstInvalidControl(): InputComponent {
        const controlKey: string = this.takeFirstInvalidControl();
        if (!controlKey) return null;

        let control: InputComponent;
        control = this.controls.find(ctrl => {
            return controlKey === this.getValidatorKey(ctrl);
        });

        return control;
    }

    scanForm(form: FormGroup | FormArray, parent: string = '', action: (control: AbstractControl, name: string) => void): void {
        Object.keys(form.controls).forEach(field => {
            const name = (parent) ? `${parent}.` + field : field;
            const control = form.get(field);
            action(control, name);
            if (control instanceof FormGroup || control instanceof FormArray) {
                this.scanForm(control, name, action);
            }
        });
    }

    getValidatorKey(control: InputComponent): string {
        if (control.validationKey) return control.validationKey;
        if (control.errorKey) return control.errorKey.replace('new_', '');
        return control.key;
    }

    getValidatorMessage(control: InputComponent, errorKey: string, errors: any): string {
        // if (control.key === 'strategy') console.log('vh-message', control, errorKey, errors, this.customMessages);

        const customMessage = this.getCustomValidatorMessage(control, errorKey);
        if (customMessage) return customMessage;

        const ctrlName: string = this.translate.instant(this.normalizeControlName(control.name));

        if (errorKey === 'required') {
            const szPleaseEnter: string = this.translate.instant('Please enter the');
            return `${szPleaseEnter} ${ctrlName}`;
        }
        else if (errorKey === 'minlength') {
            const pluralEnd: string = errors.minlength.requiredLength > 1 ? 's' : '';
            const szCharacters: string = this.translate.instant(`character${pluralEnd}`);
            return `${ctrlName} is too short. Please use at least ${errors.minlength.requiredLength} ${szCharacters}`;
        }
        else if (errorKey === 'min') {
            const pluralEnd: string = errors.min.min > 1 ? 's' : '';
            const szCharacters: string = this.translate.instant(`character${pluralEnd}`);
            return `${ctrlName} is too short. Please use at least ${errors.min.min} ${szCharacters}`;
        }
        else if (errorKey === 'maxlength') {
            const pluralEnd: string = errors.maxlength.requiredLength > 1 ? 's' : '';
            const szCharacters: string = this.translate.instant(`character${pluralEnd}`);
            return `${ctrlName} can't contain over of ${errors.maxlength.requiredLength} ${szCharacters}`;
        }
        else if (errorKey === 'max') {
            const pluralEnd: string = errors.max.max > 1 ? 's' : '';
            const szCharacters: string = this.translate.instant(`character${pluralEnd}`);
            return `${ctrlName} can't contain over of ${errors.max.max} ${szCharacters}`;
        }
        else if (errorKey === 'pattern') {
            const szPleaseEnterValid: string = this.translate.instant('Please enter valid');
            return `${szPleaseEnterValid} ${ctrlName}`;
        }

        const szInvalidDefault: string = this.translate.instant('The value is invalid');
        return szInvalidDefault;
    }

    normalizeControlName(name: string): string {
        let normalized = name.toLowerCase();
        normalized = normalized.replace(/\s+\*\s*$/, '');
        normalized = normalized.replace(/(\.\d+)/, '');
        normalized = normalized[0].toUpperCase() + normalized.slice(1);
        return normalized;
    }

    getCustomValidatorMessage(control: InputComponent, errorKey: string): string {
        // FormArrays validation keys look like:
        // - formName.arrayName.${index: number}.fieldName i.e. 'myForm.phones.0.extension'
        // but customMessages should contain corresponding key in the following format:
        // - formName.arrayName.*.fieldName i.e. 'myForm.phones.*.extension'
        const controlKey = this.getValidatorKey(control);
        const customMessageKey = controlKey.replace(reFormArrayIdxRef, '.*.');
        if (this.customMessages) {
            const item = this.customMessages.find(m => m.key === customMessageKey && m.error === errorKey);
            if (item) return item.message;
        }
        return null;
    }
}

export const reFormArrayIdxRef: RegExp = new RegExp(/(\.\d+\.)/);

export class ValidationHostItem {
    key: string;
    visible: boolean;

    constructor(key: string, visible: boolean = false) {
        this.key = key;
        this.visible = visible;
    }
}
