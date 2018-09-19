import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder } from '@angular/forms';
import {FadeAnimation} from '../../shared/fade-animation';
import {SwipeAnimation} from "../../shared/swipe-animation";
import {Lockable, Locker} from '../../models/locker.model';
import {ValidationHost} from '../../models/validation-host.model';
import {ModalEx} from '../pbx-modal/pbx-modal.component';
import {FormsSnapshots} from '../../models/forms-snapshots.model';
import {validateForm, killEvent, validateFormControls} from '../../shared/shared.functions';


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
    locker: Locker;

    form: FormGroup;
    formKey: string;

    forms: FormGroup[];

    validationHost: ValidationHost;
    snapshots: FormsSnapshots;

    modalExit: ModalEx;


    constructor(protected _fb: FormBuilder) {
        this.locker = new Locker();
        this.formKey = 'form';
        this.forms = [];
        
        this.validationHost = new ValidationHost();
        this.snapshots = new FormsSnapshots();
        
        this.initForm();
        if (this.form && this.forms.length == 0) {
            this.addForm(this.formKey, this.form);
        }

        this.modalExit = new ModalEx('', 'cancelEdit');
    }

    ngOnInit(): void {
        this.validationHost.start();
    }

    initForm(): void {
        // should be overriden in derived class
        throw new Error("Method not implemented.");
    }

    close(editMode: boolean = true, confirmCallback: () => void = null): void {
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

    addForm(formKey: string, form: FormGroup): void {
        this.forms.push(form);
        this.validationHost.addForm(form);
        this.snapshots.add(formKey, form);
    }

    resetForms() {
        // this.forms.forEach(form => form.reset());
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
}