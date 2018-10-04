import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder } from '@angular/forms';
import {FadeAnimation} from '../../shared/fade-animation';
import {SwipeAnimation} from "../../shared/swipe-animation";
import {Lockable, Locker} from '../../models/locker.model';
import {ValidationHost} from '../../models/validation-host.model';
import {ModalEx} from '../pbx-modal/pbx-modal.component';
import {FormsSnapshots} from '../../models/forms-snapshots.model';
import {validateForm, validateFormControls} from '../../shared/shared.functions';
import {MessageServices} from '../../services/message.services';


@Component({
    selector: 'pbx-form-base-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        SwipeAnimation('x', '300ms'),
        FadeAnimation('300ms')
    ]
})
export class FormBaseComponent implements OnInit, Lockable {

    form: FormGroup;
    formKey: string;

    forms: FormGroup[];

    validationHost: ValidationHost;
    snapshots: FormsSnapshots;

    locker: Locker;
    modalExit: ModalEx;


    get isNewFormModel(): boolean {
        if (this.form) {
            let id = this.form.get('id');
            return !(id && id.value);
        }
        return false;
    }


    constructor(protected fb: FormBuilder,
                protected message: MessageServices) {
        this.locker = new Locker();
        this.formKey = 'form';
        this.forms = [];

        this.validationHost = new ValidationHost();
        this.snapshots = new FormsSnapshots();

        this.modalExit = new ModalEx('', 'cancelEdit');
    }

    ngOnInit(): void {
        this.initForm();
        this.saveFormState();

        if (this.form && this.forms.length === 0) {
            this.addForm(this.formKey, this.form);
        }

        this.validationHost.start();
    }

    initForm(): void {
        // should be overriden in derived class
        throw new Error('initForm() method not implemented.');
    }

    setFormData(model: any, customInitCallback?: () => void): void {
        // TODO: modify to update specific form
        if (!model) return;

        this.form.patchValue(model);
        if (customInitCallback) customInitCallback();

        this.saveFormState();
    }

    setModelData(model: any, customInitCallback?: () => void): void {
        // TODO: modify to update from specific form
        Object.keys(this.form.value).forEach(key => {
            if (model.hasOwnProperty(key)) {
                model[key] = this.form.value[key];
            }
        });

        if (customInitCallback) customInitCallback();
    }


    addForm(formKey: string, form: FormGroup): void {
        this.forms.push(form);
        this.validationHost.addForm(form);
        this.snapshots.add(formKey, form);
    }

    resetForms() {
        this.forms.forEach(form => {
            form.reset();
        });
    }

    validateForms(): boolean {
        let result = true;
        this.forms.forEach(form => {
            form.updateValueAndValidity();
            validateFormControls(form);
            result = result && form.valid;
        });
        
        this.validationHost.clearControlsFocusedState();
        return result;
    }
    
    validateFormGroup(groupName: string, showMessage: boolean = false, message: string = ''): boolean {
        let formGroup: FormGroup;
        for (let form of this.forms) {
            formGroup = <FormGroup> form.get(groupName);
            if (formGroup) break;
        }
        if (!formGroup) return false;

        validateForm(formGroup);
        if (!formGroup.valid && showMessage) {
            this.message.writeError(message);
        }
        return formGroup.valid;
    }

    saveFormState(formKey?: string): void {
        if (formKey) {
            this.snapshots.save(formKey);
        }
        else {
            this.snapshots.saveAll();
        }
    }

    checkFormChanged(formKey?: string): boolean {
        if (formKey) {
            return this.snapshots.check(formKey);
        }
        else {
            return this.snapshots.checkAll();
        }
    }

    close(editMode: boolean = true, confirmCallback?: () => void): void {
        if (this.checkFormChanged()) {
            let message = (editMode)
                ? 'You have made changes. Do you really want to leave without saving?'
                : 'Do you really want to leave without saving?';
            this.modalExit.setMessage(message);
            this.modalExit.show();
        }
        else {
            if (confirmCallback) confirmCallback();
        }
    }
}
