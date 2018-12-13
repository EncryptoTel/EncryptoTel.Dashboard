import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder } from '@angular/forms';
import {FadeAnimation} from '../../shared/fade-animation';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {Lockable, Locker} from '../../models/locker.model';
import {ValidationHost} from '../../models/validation-host.model';
import {ModalEx} from '../pbx-modal/pbx-modal.component';
import {FormsSnapshots} from '../../models/forms-snapshots.model';
import {validateForm, validateFormControls} from '../../shared/shared.functions';
import {MessageServices} from '../../services/message.services';
import {InputComponent} from '@elements/pbx-input/pbx-input.component';
import {ScrollEvent} from '@shared/scroll.directive';


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

    forms: { key: string, form: FormGroup }[];

    validationHost: ValidationHost;
    snapshots: FormsSnapshots;

    locker: Locker;
    modalExit: ModalEx;

    formPanel: Element = null;


    get isNewFormModel(): boolean {
        if (this.form) {
            const id = this.form.get('id');
            return !(id && id.value);
        }
        return false;
    }


    constructor(
        protected fb: FormBuilder,
        protected message: MessageServices
    ) {
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
            this.showExitModal(editMode, confirmCallback);
        }
        else {
            if (confirmCallback) confirmCallback();
        }
    }

    closeForm(editMode: boolean = true, formKey: string, confirmCallback?: () => void): void {
        if (this.checkFormChanged(formKey)) {
            this.showExitModal(editMode, confirmCallback);
        }
        else {
            if (confirmCallback) confirmCallback();
        }
    }

    showExitModal(editMode: boolean, confirmCallback?: () => void): void {
        const message = (editMode)
            ? 'You have made changes. Do you really want to leave without saving?'
            : 'Do you really want to leave without saving?';
        this.modalExit.setMessage(message);
        this.modalExit.confirmCallback = confirmCallback;
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
            let elementTop: number = control.inputDiv.nativeElement.parentElement.offsetTop;
            if (control.name.toLowerCase() === 'ivr name' || elementTop <= 30) {
                elementTop = 0;
            }
            this.formPanel.scrollTop = elementTop;
        }
        else if (this.formPanel && this.formPanel.scrollTop) {
            this.formPanel.scrollTop = 0;
        }
    }
}
