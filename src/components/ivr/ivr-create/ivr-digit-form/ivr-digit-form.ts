import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormBuilder, Validators, FormGroup, ValidationErrors } from '@angular/forms';

import { IvrService } from '@services/ivr.service';
import { RefsServices } from '@services/refs.services';
import { MessageServices } from '@services/message.services';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { FadeAnimation } from '@shared/fade-animation';
import { StorageService } from '@services/storage.service';
import { IvrFormInterface } from '../form.interface';
import { validateFormControls } from '@shared/shared.functions';
import { Subscription } from 'rxjs/Subscription';

export enum DigitActions {
    EXTENSION_NUMBER = 1,
    EXTERNAL_NUMBER = 2,
    SEND_TO_IVR = 3
}

@Component({
    selector: 'pbx-ivr-digit-form',
    templateUrl: './ivr-digit-form.html',
    styleUrls: ['./ivr-digit-form.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrDigitFormComponent extends FormBaseComponent implements OnInit, IvrFormInterface, OnDestroy {
    onDelete: Function;
    ngOnDestroy(): void {

    }
    references: any;
    data: any;
    isValidForm: Function;
    actionVal = 0;
    digitFormKey: string = 'digitForm';
    loading: number = 0;
    digitForm: FormGroup;
    digits: Array<any> = [];
    sipInners: any;
    then_data = [
        { id: 1, code: "Redirect to extension number" },
        { id: 2, code: "Redirect to external number" },
        { id: 3, code: "Create new level" }
    ];
    // -- properties ----------------------------------------------------------


    // -- component lifecycle methods -----------------------------------------

    constructor(public service: IvrService,
        protected fb: FormBuilder,
        protected message: MessageServices) {
        super(fb, message);
    }

    ngOnInit() {
        console.log(this.data);
        super.ngOnInit();
        this.service.reset();
        for (let i = 1; i <= 10; i++) {
            const number = i % 10;
            if (!this.references.usedDiget.includes(i) || i === this.data.digit) {
                this.digits.push({ id: number, title: number.toString() });
            }
        }
        this.digits.push({ id: 11, title: '*' });
        this.digits.push({ id: 12, title: '#' });

    }

    initForm(): void {
        this.digitForm = this.fb.group({
            digit: [null, [Validators.required]],
            description: ['', [Validators.maxLength(255)]],
            action: [null, [Validators.required]],
            parameter: [null, [Validators.required]],
        });
        this.addForm(this.digitFormKey, this.digitForm);
        this.digitForm.patchValue(this.data);

        this.digitForm.get("action").valueChanges.subscribe(val => {
            this.showParameter(val);
        });
    }
    
    getData() {
        console.log(this.digitForm.value);
        this.getFormValidationErrors();
        if (this.digitForm.valid) {
            return this.digitForm.value;
        } else {
            validateFormControls(this.digitForm);
        }
        this.validationHost.clearControlsFocusedState();
        return null;
    }

    getExtensions(id: number): void {
        this.loading++;
        this.service.getExtensions(id).then(response => {
            this.sipInners = response.items;
        }).catch(() => {
        })
            .then(() => this.loading--);
    }

    showParameter(val) {
        this.actionVal = val;
        switch (val) {
            case DigitActions.EXTENSION_NUMBER:
                this.getExtensions(this.references.sipId);
                break;
            case DigitActions.EXTERNAL_NUMBER:
                this.sipInners = [];
                break;
            case DigitActions.SEND_TO_IVR:
                break;
        }
    }

    getFormValidationErrors() {
        Object.keys(this.digitForm.controls).forEach(key => {

            const controlErrors: ValidationErrors = this.digitForm.get(key).errors;
            if (controlErrors != null) {
                Object.keys(controlErrors).forEach(keyError => {
                    console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
                });
            }
        });
    }

    deleteDigit() {
        if(this.onDelete) {
            this.onDelete(this.data);
        }
    }
}
