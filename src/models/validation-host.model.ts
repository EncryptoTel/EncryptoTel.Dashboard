import { FormGroup, FormArray, FormControl, FormControlName } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { InputComponent } from "../elements/pbx-input/pbx-input.component";
import { Lockable, Locker } from "./locker.model";


export class ValidationHost implements Lockable {
    locker: Locker;
    active: boolean;
    monitors: Subscription[];

    forms: FormGroup[];
    items: ValidationHostItem[];

    selectedControl: string;
    controls: InputComponent[];

    customMessages: any[];

    // -- component lifecycle methods -----------------------------------------

    constructor() {
        this.forms = [];
        this.controls = [];

        this.locker = new Locker();
        this.active = false;
        this.monitors = [];
    }

    addForm(form: FormGroup): void {
        this.forms.push(form);
        this.initItems();
        let monitor = form.statusChanges.subscribe(state => this.checkForm(state));
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
        // console.log('vhost-items', this.items);
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
        let controlKey = this.getValidatorKey(control);
        let item = this.items.find(i => i.key == controlKey);
        // console.log('err-visible', controlKey, control.inErrorState, item);
        return control.inErrorState && item && item.visible;
    }

    updateState(): void {
        if (!this.active) return;

        let mouseIsInForm = false;
        let control = this.controls.find(c => c.inMouseHover);
        if (control) {
            mouseIsInForm = true;
            if (control.inErrorState) {
                this.setControlError(control);
                return;
            }
        }

        let inputIsInForm = false;
        control = this.controls.find(c => c.inFocus);
        if (control) {
            inputIsInForm = true;
            if (control.inErrorState) {
                this.setControlError(control);
                return;
            }
        }
        
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
    }

    takeFirstInvalidControl(): string {
        let firstInvalidControl = null;
        this.forms.forEach(form => {
            this.scanForm(form, '', (control, name) => {
                if (!control.valid && control.errors && !firstInvalidControl) {
                    firstInvalidControl = name;
                }
            });
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
        this.forms.forEach(form => {
            this.scanForm(form, '', (formControl, name) => {
                if (name == controlKey) {
                    let errorKeys = Object.keys(formControl.errors);
                    errorMessage = this.getValidatorMessage(control, errorKeys[0], formControl.errors);
                }
            });
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
            let name = this.getControlName(control);
            return `Please enter ${name}`;
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
            let name = this.getControlName(control);
            return `Please enter valid ${name}`;
        }
        // console.log('vh-message', control, errorKey, errors);
        return 'The value is invalid';
    }

    getControlName(control: InputComponent): string {
        let name = control.name.toLowerCase();
        name = name.replace(/\s+\*\s*$/, '');
        return name;
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
