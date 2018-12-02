import { Subject } from 'rxjs/Subject';
import { Component, OnInit, OnDestroy } from '@angular/core';

import {
    FormBuilder,
    Validators,
    FormGroup,
    ValidationErrors
} from '@angular/forms';

import { IvrService } from '@services/ivr.service';
import { RefsServices } from '@services/refs.services';
import { MessageServices } from '@services/message.services';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { FadeAnimation } from '@shared/fade-animation';
import { StorageService } from '@services/storage.service';
import { IvrFormInterface } from '../form.interface';
import { validateFormControls } from '@shared/shared.functions';
import { Subscription } from 'rxjs/Subscription';
import { ModalEx } from '@elements/pbx-modal/pbx-modal.component';
import { IvrLevel, DigitActions } from '@models/ivr.model';


@Component({
    selector: 'pbx-ivr-digit-form',
    templateUrl: './ivr-digit-form.html',
    styleUrls: ['./ivr-digit-form.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class IvrDigitFormComponent extends FormBaseComponent
    implements OnInit, IvrFormInterface, OnDestroy {
    onAddLevel: Function;
    references: any;
    data: any;
    actionVal = 0;
    digitFormKey: string = 'digitForm';
    loading: number = 0;
    digitForm: FormGroup;
    digits: Array<any> = [];
    sipInners: any;
    paramsInfo = {
        label: '',
        option: [],
        visible: false,
        validators: [],
    };
    onFormChange: Subject<any>;
    constructor(
        public service: IvrService,
        protected fb: FormBuilder,
        protected message: MessageServices
    ) {
        super(fb, message);
        this.onFormChange = new Subject();

        this.validationHost.customMessages = [
            {name: 'External number', error: 'pattern', message: 'Phone number contains invalid characters. You can only use numbers.'},
        ];
    }

    onDelete: Function;
    ngOnDestroy(): void {}

    ngOnInit() {
        this.initAvaliableDigit();
        super.ngOnInit();
        this.service.reset();
        if (!this.data.action) {
            this.data.action = DigitActions.CANCEL_CALL;
        }
        this.digitForm.patchValue(this.data);
    }

    initForm(): void {
        this.digitForm = this.fb.group({
            digit: [null, [Validators.required]],
            description: ['', [Validators.maxLength(255)]],
            action: [null, [Validators.required]],
            parameter: [null, [Validators.required]]
        });
        
        this.addForm(this.digitFormKey, this.digitForm);
        
        this.digitForm.get('action').valueChanges.subscribe(val => {
            this.loading++;
            this.service
                .showParameter(
                    val,
                    this.references.sipId,
                    this.references.levels
                )
                .then(response => {
                    this.paramsInfo = response;
                    this.digitForm.get('parameter').setValidators(this.paramsInfo.validators)
                    this.digitForm.get('parameter').setValue(null);
                    this.digitForm.get('parameter').markAsUntouched();
                    this.validationHost.initItems();
                })
                .catch(() => {})
                .then(() => {
                    this.loading--;
                });
        });

        this.digitForm.get('parameter').valueChanges.subscribe(val => {
            if (this.digitForm.value.action === '7' && val === -1) {
                console.log(val);
                val = this.onAddLevel(new IvrLevel());
                this.digitForm
                    .get('parameter')
                    .setValue(val, { onlySelf: true });
                console.log(val);
            }
        });
        
        this.digitForm.statusChanges.subscribe(() => {
            this.onFormChange.next(this.digitForm);
        });
    }

    getData() {
        return this.validateForms() ? this.form.value : null;
    }

    getExtensions(id: number): void {
        this.loading++;
        this.service
            .getExtensions(id)
            .then(response => {
                this.sipInners = response.items;
            })
            .catch(() => {})
            .then(() => this.loading--);
    }

    deleteDigit() {
        if (this.onDelete) {
            this.onDelete(this.data);
        }
    }

    initAvaliableDigit() {
        for (let i = 1; i <= 10; i++) {
            const number = i % 10;
            if (
                !this.references.usedDigit.includes(i.toString()) ||
                i.toString() === this.data.digit
            ) {
                this.digits.push({
                    id: number.toString(),
                    title: number.toString()
                });
            }
        }
        if (
            !this.references.usedDigit.includes('*') ||
            this.data.digit === '*'
        ) {
            this.digits.push({ id: '*', title: '*' });
        }
        if (
            !this.references.usedDigit.includes('#') ||
            this.data.digit === '#'
        ) {
            this.digits.push({ id: '#', title: '#' });
        }
    }
}
