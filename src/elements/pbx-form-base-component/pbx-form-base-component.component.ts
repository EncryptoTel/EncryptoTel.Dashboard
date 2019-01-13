import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder } from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {ModalEx} from '../pbx-modal/pbx-modal.component';
import {Lockable, Locker} from '@models/locker.model';
import {ValidationHost} from '@models/validation-host.model';
import {FormsSnapshots} from '@models/forms-snapshots.model';
import {MessageServices} from '@services/message.services';
import {InputComponent} from '@elements/pbx-input/pbx-input.component';
import {validateForm, validateFormControls} from '@shared/shared.functions';
import {FadeAnimation} from '@shared/fade-animation';
import {SwipeAnimation} from '@shared/swipe-animation';
import {ScrollEvent} from '@shared/scroll.directive';
import {CanFormComponentDeactivate} from '@services/can-deactivate-form-guard.service';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';


@Component({
    selector: 'pbx-form-base-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        SwipeAnimation('x', '300ms'),
        FadeAnimation('300ms')
    ]
})
export class FormBaseComponent implements OnInit, Lockable, CanFormComponentDeactivate {

    form: FormGroup;
    formKey: string;

    forms: { key: string, form: FormGroup }[];

    validationHost: ValidationHost;
    snapshots: FormsSnapshots = new FormsSnapshots();

    locker: Locker = new Locker();
    modalExit: ModalEx = new ModalEx('', 'cancelEdit');

    formPanel: Element = null;

    get isModelCreated(): boolean {
        if (this.form) {
            const id = this.form.get('id');
            return !(id && id.value);
        }
        return false;
    }

    constructor(
        protected fb: FormBuilder,
        protected messages: MessageServices,
        protected translate: TranslateService,
    ) {
        this.formKey = 'form';
        this.forms = [];

        this.validationHost = new ValidationHost(this.translate);
    }

    ngOnInit(): void {
        this.initForm();

        if (this.form && this.forms.length === 0) {
            this.addForm(this.formKey, this.form);
        }
        this.saveFormState();

        this.validationHost.start();
    }

    get modelEdit(): boolean {
        // should be overriden in derived class
        throw new Error('modelEdit property not implemented.');
    }

    initForm(): void {
        // should be overriden in derived class
        throw new Error('initForm() method not implemented.');
    }

    canDeactivate(dataChanged?: boolean): Observable<boolean> | Promise<boolean> | boolean {
        if (!dataChanged && !this.checkFormChanged()) return true;

        return Observable.create((observer: Observer<boolean>) => {
            this.showExitModal(
                this.modelEdit,
                () => {
                    observer.next(true);
                    observer.complete();
                },
                () => {
                    observer.next(false);
                    observer.complete();
                });
        });
    }

    handleScroll(event: ScrollEvent) {
        this.formPanel = event.originalEvent.srcElement;
    }

    getForm(formKey: string): FormGroup | null {
        const item = this.forms.find(f => f.key === formKey);
        return (item) ? item.form : null;
    }

    setFormData(model: any, customInitCallback?: () => void): void {
        this.setFormDataForForm(model, this.formKey, customInitCallback);
    }

    setFormDataForForm(model: any, formKey: string, customInitCallback?: () => void): void {
        if (!model) return;

        const form = this.getForm(formKey);

        if (form) {
            form.patchValue(model);
            if (customInitCallback) customInitCallback();

            this.saveFormState(formKey);
        }
    }

    setModelData(model: any, customInitCallback?: () => void): void {
        this.setModelDataByForm(model, this.formKey, customInitCallback);
    }

    setModelDataByForm(model: any, formKey: string, customInitCallback?: () => void): void {
        const form = this.getForm(formKey);

        if (form) {
            Object.keys(this.form.value).forEach(key => {
                if (model.hasOwnProperty(key)) {
                    model[key] = this.form.value[key];
                }
            });

            if (customInitCallback) customInitCallback();
        }
    }

    addForm(formKey: string, form: FormGroup): void {
        if (!this.getForm(formKey)) {
            this.forms.push({ key: formKey, form: form });
            this.validationHost.addForm(form);
            this.snapshots.add(formKey, form);
        }
    }

    resetForms() {
        this.forms.forEach(item => {
            item.form.reset();
        });
        this.saveFormState();
    }

    validateForm(formKey: string): boolean {
        const item = this.forms.find(f => f.key === formKey);
        if (item) {
            item.form.updateValueAndValidity();
            validateFormControls(item.form);
            return item.form.valid;
        }
        return false;
    }

    validateForms(): boolean {
        let result = true;

        this.forms.forEach(item => {
            item.form.updateValueAndValidity();
            validateFormControls(item.form);
            result = result && item.form.valid;
        });

        this.validationHost.clearControlsFocusedState();

        return result;
    }

    validateFormGroup(groupName: string, showMessage: boolean = false, message: string = ''): boolean {
        let formGroup: FormGroup;
        for (const item of this.forms) {
            formGroup = <FormGroup>item.form.get(groupName);
            if (formGroup) { break; }
        }
        if (!formGroup) {
            return false;
        }

        validateForm(formGroup);
        if (!formGroup.valid && showMessage) {
            this.messages.writeError(this.translate.instant(message));
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

    close(confirmCallback?: () => void): void {
        if (this.checkFormChanged()) {
            this.showExitModal(this.modelEdit, confirmCallback);
        }
        else {
            if (confirmCallback) confirmCallback();
        }
    }

    closeForm(formKey: string, confirmCallback?: () => void): void {
        if (this.checkFormChanged(formKey)) {
            this.showExitModal(this.modelEdit, confirmCallback);
        }
        else {
            if (confirmCallback) confirmCallback();
        }
    }

    showExitModal(editMode: boolean, confirmCallback?: () => void, cancelCallback?: () => void): void {
        const message = (editMode)
            ? this.translate.instant('You have made changes. Do you really want to leave without saving?')
            : this.translate.instant('Do you really want to leave without saving?');
        this.modalExit.setMessage(message);
        this.modalExit.title = this.translate.instant(this.modalExit.title);
        this.modalExit.buttons.forEach(button => {
            button.value = this.translate.instant(button.value);
        });
        this.modalExit.confirmCallback = confirmCallback;
        this.modalExit.cancelCallback = cancelCallback;
        this.modalExit.show();
    }

    showWarningModal(message: string, confirmCallback?: () => void): void {
        this.modalExit.setMessage(message);
        this.modalExit.confirmCallback = confirmCallback;
        this.modalExit.show();
    }

    /**
     * Scrolls form DOM element to the first error element
     * @param element invalid control DOM element
     */
    scrollToFirstError(): void {
        const control: InputComponent = this.validationHost.getFirstInvalidControl();
        if (control && this.formPanel && this.formPanel.scrollTop) {
            const elementTop: number = control.inputDiv.nativeElement.parentElement.offsetTop;
            this.formPanel.scrollTop = elementTop;
        }
        else if (this.formPanel && this.formPanel.scrollTop) {
            this.formPanel.scrollTop = 0;
        }
    }
}
