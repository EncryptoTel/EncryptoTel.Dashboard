import { FormGroup, FormArray, FormControl, FormControlName, AbstractControl } from "@angular/forms";
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
        console.log('vhost-items', this.items);
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
        // control.validationKey == 'ruleActions' && console.log('err-visible', controlKey, control.inErrorState, item);
        // if (control.key == 'timeout' && control.inErrorState) return true;
        return control.inErrorState && item && item.visible;
    }

    updateState(): void {
        // console.log('update-state', this.controls);
        if (!this.active) return;

        let mouseIsInForm = false;
        let control = this.controls.find(c => c.inMouseHover);
        if (control) {
            // console.log('hover', control.name);
            mouseIsInForm = true;
            if (control.inErrorState) {
                this.setControlError(control);
                // console.log('hover-error', this.items);
                return;
            }
        }

        let inputIsInForm = false;
        control = this.controls.find(c => c.inFocus);
        if (control) {
            // console.log('focus', control.name);
            inputIsInForm = true;
            if (control.inErrorState) {
                this.setControlError(control);
                // console.log('focus-error', this.items);
                return;
            }
        }
        
        // console.log('descr', this.controls.find(c => c.key == 'description'));

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

    private takeFirstInvalidControl(): string {
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

    private scanForm(form: FormGroup | FormArray, parent: string = '', action: (control: AbstractControl, name: string) => void): void {
        Object.keys(form.controls).forEach(field => {
            let name = (parent) ? `${parent}.` + field : field;
            const control = form.get(field);
            action(control, name);
            /*if (control instanceof FormControl) {
                action(control, name);
            }
            else*/ if (control instanceof FormGroup || control instanceof FormArray) {
                this.scanForm(control, name, action);
            }
        });
    }

    private getValidatorKey(control: InputComponent): string {
        if (control.validationKey) return control.validationKey;
        if (control.errorKey) return control.errorKey.replace('new_', '');
        return control.key;
    }

    private getValidatorMessage(control: InputComponent, errorKey: string, errors: any): string {
        const customMessage = this.getCustomValidatorMessage(control, errorKey);
        if (customMessage) return customMessage;
        // console.log('vh-message', control, errorKey, errors);

        if (errorKey == 'required') {
            const name = this.getControlName(control);
            return `Please enter ${name}`;
        }
        else if (errorKey == 'minlength') {
            const pluralEnd = errors.minlength.requiredLength > 1 ? 's' : '';
            return `Please enter at least ${errors.minlength.requiredLength} character${pluralEnd}`;
        }
        else if (errorKey == 'min') {
            console.log('error', errors);
            const pluralEnd = errors.min.min > 1 ? 's' : '';
            return `Please enter at least ${errors.min.min} character${pluralEnd}`;
        }
        else if (errorKey == 'maxlength') {
            const pluralEnd = errors.maxlength.requiredLength > 1 ? 's' : '';
            return `Please enter no more than ${errors.maxlength.requiredLength} character${pluralEnd}`;
        }
        else if (errorKey == 'max') {
            const pluralEnd = errors.max.max > 1 ? 's' : '';
            return `Please enter no more than ${errors.max.max} character${pluralEnd}`;
        }
        else if (errorKey == 'pattern') {
            const name = this.getControlName(control);
            return `Please enter valid ${name}`;
        }
        console.log('vh-unspec-message', control.name, errorKey);
        return 'The value is invalid';
    }

    private getControlName(control: InputComponent): string {
        let name = control.name.toLowerCase();
        name = name.replace(/\s+\*\s*$/, '');
        return name;
    }
    
    private getCustomValidatorMessage(control: InputComponent, errorKey: string): string {
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
