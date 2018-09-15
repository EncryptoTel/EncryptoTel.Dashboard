import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder } from '@angular/forms';
import {FadeAnimation} from '../../shared/fade-animation';
import {SwipeAnimation} from "../../shared/swipe-animation";
import {Lockable, Locker} from '../../models/locker.model';
import {ValidationHost} from '../../models/validation-host.model';
import {ModalEx} from '../pbx-modal/pbx-modal.component';
import {FormsSnapshots} from '../../models/forms-snapshots.model';
import {validateForm, killEvent} from '../../shared/shared.functions';


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

    validationHost: ValidationHost;
    snapshots: FormsSnapshots;

    modal: ModalEx;


    constructor(protected _fb: FormBuilder) {
        this.locker = new Locker();
        this.formKey = 'form';
        
        this.initForm();
        this.validationHost = new ValidationHost(this.form);
        
        this.snapshots = new FormsSnapshots();
        this.snapshots.add(this.formKey, this.form);
    }

    ngOnInit(): void {
        this.validationHost.start();
    }

    initForm(): void {
        // should be overriden in derived class
        throw new Error("Method not implemented.");
    }

    setFormData() {
        this.form.reset();
    }

    validateForm(): boolean {
        validateForm(this.form);
        return this.form.valid;
    }

    saveFormState(): void {
        this.snapshots.save(this.formKey);
    }

    get formChanged(): boolean {
        return this.snapshots.check(this.formKey);
    }
}