import { FormGroup, FormArray, FormControl, FormControlName } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { InputComponent } from "../elements/pbx-input/pbx-input.component";
import { Lockable, Locker } from "./locker.model";


export class ValidationHost implements Lockable {
    locker: Locker;
    active: boolean;
    monitor: Subscription;

    form: FormGroup;
    items: ValidationHostItem[];

    selectedControl: string;
    controls: InputComponent[];

    customMessages: any[];

    // -- component lifecycle methods -----------------------------------------

    constructor(form: FormGroup) {
        this.form = form;
        this.items = [];
        this.controls = [];

        this.scanForm(form, '', (control, name) => {
            if (control.validator) {
                this.items.push(new ValidationHostItem(name));
            }
        });

        this.locker = new Locker();
        this.active = false;
        this.monitor = form.statusChanges.subscribe(state => this.checkForm(state));
    }

    addControl(control: InputComponent): void {
        this.controls.push(control);
    }

    // -- public methods ------------------------------------------------------

    start(): void {
        this.active = true;
    }

    stop(): void {
        this.active = false;
    }

    isErrorVisible(control: InputComponent): boolean {
        let controlKey = this.getValidatorKey(control);
        let item = this.items.find(i => i.key == controlKey);
        return control.inErrorState && item && item.visible;
    }

    updateState(): void {
        if (!this.active) return;

        let mouseIsInForm = false;
        let control = this.controls.find(c => c.inMouseHover);
        if (control) {
            mouseIsInForm = true;
            if (control.inErrorState) {
                // console.log('set-error', control.name);
                this.setControlError(control);
                return;
            }
        }

        let inputIsInForm = false;
        control = this.controls.find(c => c.inFocus);
        if (control) {
            inputIsInForm = true;
            if (control.inErrorState) {
                // console.log('set-error', control.name);
                this.setControlError(control);
                return;
            }
        }
        
        // console.log('stat', mouseIsInForm, inputIsInForm);
        if (!mouseIsInForm && !inputIsInForm) {
            let controlKey = this.takeFirstInvalidControl();
            this.setErrorVisible(controlKey);
        }
        else {
            this.clearErrorsVisibility();
        }
    }

    clearErrorsVisibility(): void {
        this.items.forEach(item => item.visible = false);
    }

    clearControlsFocusedState(): void {
        this.controls.forEach(control => control.inFocus = false);
        this.updateState();
    }

    setControlError(control: InputComponent): void {
        let controlKey = this.getValidatorKey(control);
        this.setErrorVisible(controlKey);
    }

    setErrorVisible(controlKey: string): void {
        if (controlKey != this.selectedControl || !this.items.find(item => item.visible)) {
            this.selectedControl = controlKey;

            this.clearErrorsVisibility();
            
            this.locker.lock();
            setTimeout(() => {
                this.locker.unlock();
                if (this.locker.free) {
                    let item = this.items.find(i => i.key == controlKey);
                    if (item) item.visible = true;
                }
            }, 300);
        }
    }

    // -- common methods ------------------------------------------------------

    checkForm(state: any): void {
        if (state == 'INVALID') 
            this.updateState();
        
        // let control = this.controls.find(c => c.inFocus && c.inErrorState);
        // if (control) console.log('control', control);
        let name = this.controls.find(c => c.key == 'name');
    }

    takeFirstInvalidControl(): string {
        let firstInvalidControl = null;
        this.scanForm(this.form, '', (control, name) => {
            if (!control.valid && control.errors && !firstInvalidControl) {
                firstInvalidControl = name;
            }
        });
        return firstInvalidControl;
    }

    scanForm(form: FormGroup | FormArray, parent: string = '', action: (control: FormControl, name: string) => void): void {
        Object.keys(form.controls).forEach(field => {
            let name = (parent) ? `${parent}.` + field : field;
            const control = form.get(field);
            if (control instanceof FormControl) {
                action(control, name);
            }
            else if (control instanceof FormGroup || control instanceof FormArray) {
                this.scanForm(control, name, action);
            }
        });    
    }

    getErrorMessage(control: InputComponent): string {
        let controlKey = this.getValidatorKey(control);
        let errorMessage = null;
        this.scanForm(this.form, '', (formControl, name) => {
            if (name == controlKey) {
                let errorKeys = Object.keys(formControl.errors);
                errorMessage = this.getValidatorMessage(control, errorKeys[0], formControl.errors);
            }
        });
        return errorMessage;
    }

    getValidatorKey(control: InputComponent): string {
        if (control.errorKey) return control.errorKey.replace('new_', '');
        return control.key;
    }

    getValidatorMessage(control: InputComponent, errorKey: string, errors: any): string {
        let customMessage = this.getCustomValidatorMessage(control, errorKey);
        if (customMessage) return customMessage;

        if (errorKey == 'required') {
            let keyName = control.name.toLowerCase();
            return `Please enter ${keyName}`;
        }
        else if (errorKey == 'minlength') {
            let pluralEnding = errors.minlength.requiredLength > 1 ? 's' : '';
            return `Please enter at least ${errors.minlength.requiredLength} character${pluralEnding}`;
        }
        else if (errorKey == 'maxlength') {
            let pluralEnding = errors.maxlength.requiredLength > 1 ? 's' : '';
            return `Please enter no more than ${errors.maxlength.requiredLength} character${pluralEnding}`;
        }
        else if (errorKey == 'pattern') {
            // Nothing todo right now here
        }
        return 'The value is invalid';
    }
    
    getCustomValidatorMessage(control: InputComponent, errorKey: string): string {
        if (this.customMessages) {
            let item = this.customMessages.find(m => m.name == control.name && m.error == errorKey);
            if (item) return item.message;
        }
        return null;
    }
}

export class ValidationHostItem {
    key: string;
    visible: boolean;

    constructor(key: string, visible: boolean = false) {
        this.key = key;
        this.visible = visible;
    }
}