import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';

import {SettingsService} from '../../../../services/settings.service';
import {emailRegExp, nameRegExp, phoneRegExp, numberRegExp} from '../../../../shared/vars';
import {validateForm, killEvent} from '../../../../shared/shared.functions';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {passwordConfirmation} from '../../../../shared/password-confirmation';
import {MessageServices} from '../../../../services/message.services';
import {UserServices} from '../../../../services/user.services';
import {FormBaseComponent} from '../../../../elements/pbx-form-base-component/pbx-form-base-component.component';
import {SettingsModel} from '../../../../models/settings.models';
import {LocalStorageServices} from '../../../../services/local-storage.services';
import {TranslateService} from '../../../../services/translate.service';
import {LangStateService} from '../../../../services/state/lang.state.service';
import {text} from '@angular/core/src/render3/instructions';


export enum EmailChangeState {
    NOT_STARTED,
    CONFIRMATION_CODE_SENT,
    COMPLETED
}

@Component({
    selector: 'profile-component',
    templateUrl: './template.html',
    styleUrls: ['../local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class ProfileComponent extends FormBaseComponent implements OnInit {

    model: SettingsModel;
    
    generalForm: FormGroup;
    emailChange: FormGroup;
    passwordChange: FormGroup;

    userDefaultPhoto: string;

    emailChangeState: EmailChangeState;
    @ViewChild('fileInput') fileInput: ElementRef;

    get messageSent(): boolean {
        return this.emailChangeState === EmailChangeState.CONFIRMATION_CODE_SENT;
    }

    loading: number;
    saveButton: any;
    cancelButton: any;
    text: any;

    // --- component lifecycle methods ----------------------------------------

    constructor(private service: SettingsService,
                protected fb: FormBuilder,
                protected message: MessageServices,
                private router: Router,
                private _storage: LocalStorageServices,
                private translate: TranslateService,
                private langState: LangStateService,
                private user: UserServices) {
        super(fb, message);
        this.text = langState.get();

        this.userDefaultPhoto = './assets/images/avatar/no_avatar.jpg';
        this.loading = 0;
        this.emailChangeState = EmailChangeState.NOT_STARTED;
        this.saveButton = { buttonType: 'success', value: this.text['save'], inactive: false, loading: false };
        this.cancelButton = { buttonType: 'cancel', value: this.text['cancel']};

        // Override default ValidationHost messages
        this.validationHost.customMessages = [
            { name: 'Password confirmation', error: 'required', message: 'Please confirm password' },
        ];
    }

    ngOnInit() {
        this.langState.change.subscribe(textLang => {
            this.text = textLang;
        });
        super.ngOnInit();
        this.getSettings();
    }

    // --- initialization -----------------------------------------------------

    initForm(): void {
        this.generalForm = this.fb.group({
            firstname:  [null, [ Validators.required, Validators.pattern(nameRegExp) ]],
            lastname:   [null, [ Validators.pattern(nameRegExp) ]],
            patronymic: [null, [ Validators.pattern(nameRegExp) ]],
            phone:      [null, [ Validators.pattern(phoneRegExp), Validators.minLength(7), Validators.maxLength(16) ]]
        });
        this.addForm('generalForm', this.generalForm);

        this.emailChange = this.fb.group({
            email:  [null, [ Validators.required, Validators.pattern(emailRegExp) ]],
            code:   [null, [ Validators.required, Validators.minLength(6), Validators.pattern(numberRegExp) ]],
        });
        this.addForm('emailChange', this.emailChange);

        this.passwordChange = this.fb.group({
            oldPassword:            [null, [ Validators.required, Validators.minLength(6) ]],
            password:               [null, [ Validators.required, Validators.minLength(6) ]],
            password_confirmation:  [null, [ Validators.required, Validators.minLength(6) ]],
        }, {
                validator: (formGroup: FormGroup) => {
                    return passwordConfirmation(formGroup);
                }
        });
        this.addForm('passwordChange', this.passwordChange);
    }

    // --- event handlers -----------------------------------------------------

    confirmClose(): void {
        this.router.navigateByUrl('/cabinet/settings');
    }

    change() {
        validateForm(this.generalForm);
        // this.saveButton.inactive = !this.generalForm.valid;
    }

    save(event?: Event): void {
        killEvent(event);
        let validationResult = true;

        const profileFormChanged = this.checkFormChanged('generalForm');
        // console.log('generalForm', profileFormChanged);
        if (profileFormChanged) {
            validateForm(this.generalForm);
            validationResult = validationResult && this.generalForm.valid;
        }

        const emailFormChanged = this.checkFormChanged('emailChange');
        // console.log('emailChanged', emailFormChanged);
        if (emailFormChanged) {
            validationResult = validationResult && this.validateEmailForm();
        }

        const passwordFormChanged = this.checkFormChanged('passwordChange');
        // console.log('passwordChanged', passwordFormChanged);
        if (passwordFormChanged) {
            validateForm(this.passwordChange);
            validationResult = validationResult && this.passwordChange.valid;
        }

        if (validationResult) {
            profileFormChanged && this.saveProfileSettings();
            emailFormChanged && this.saveEmailSettings();
            passwordFormChanged && this.savePasswordSettings();
        }
    }

    // --- forms processing methods -------------------------------------------

    inputValidation(form: FormGroup, name: string, errorType?: string): boolean {
        const field = form.controls[name];
        return errorType
            ? field && field.errors[errorType] && (field.dirty || field.touched)
            : field && field.invalid && (field.dirty || field.touched);
    }

    initFormData(formKey: string, form: FormGroup, data?: any): void {
        if (data) {
            Object.keys(form.controls).map(key => {
                data.profile.user.hasOwnProperty(key) && form.controls[key].setValue(data.profile.user[key]);
            });
        }
        this.saveFormState(formKey);
    }

    validateEmailForm(): boolean {
        if (this.emailChangeState == EmailChangeState.NOT_STARTED) {
            return !this.inputValidation(this.emailChange, 'email');
        }
        else if (this.emailChangeState == EmailChangeState.CONFIRMATION_CODE_SENT) {
            return !this.inputValidation(this.emailChange, 'code');
        }
        return false;
    }

    // --- data methods -------------------------------------------------------

    onValueChange($event) {
        let tmp: any;
        tmp = $event;
        if (tmp.value === 19) {
            console.log('ru');
            this._storage.writeItem('user_lang', 'ru');
        } else if (tmp.value === 18) {
            console.log('en');
            this._storage.writeItem('user_lang', 'en');
        }

        this.translate.translate();
        this.langState.set(this.translate.getTranslate());
    }

    getSettings(): void {
        this.loading ++;

        this.service.getProfileSettings().then(response => {
            // console.log('profile', response);
            this.model = SettingsModel.create(response.profile.settings);
            this.userDefaultPhoto = response.profile.user.avatar;
            this.initFormData('generalForm', this.generalForm, response);
            this.initFormData('emailChange', this.emailChange, response);
            this.initFormData('passwordChange', this.passwordChange);
        }).catch(() => {})
          .then(() => this.loading --);
    }

    saveProfileSettings(): void {
        this.loading ++;

        this.service.saveProfileSettings(this.generalForm.value).then(() => {
            this.getSettings();
            this.user.fetchProfileParams().then();
        }).catch(() => {})
          .then(() => this.loading --);
    }

    saveEmailSettings(): void {
        if (this.emailChangeState == EmailChangeState.NOT_STARTED) {
            this.loading ++;
            
            this.service.requestEmailChange(this.emailChange.get('email').value).then(response => {
                this.emailChangeState = EmailChangeState.CONFIRMATION_CODE_SENT;
                // this._message.writeSuccess(response.message);
            }).catch(() => {})
              .then(() => this.loading --);
        }
        else if (this.emailChangeState == EmailChangeState.CONFIRMATION_CODE_SENT) {
            this.loading ++;
            
            this.service.confirmEmailChange(this.emailChange.get('code').value).then(response => {
                this.emailChange.get('code').setValue('');
                this.saveFormState('emailChange');
                this.emailChangeState = EmailChangeState.NOT_STARTED;
                // this._message.writeSuccess(response.message);
            }).catch(() => {})
              .then(() => this.loading --);
        }
    }

    savePasswordSettings(): void {
        this.loading ++;

        this.service.changePassword(this.passwordChange.value).then(response => {
            this.passwordChange.reset();
            // this._message.writeSuccess(response.message);
        }).catch(() => {})
          .then(() => this.loading --);
    }

    // --- old implementation ---

    passwordsMismatch(): boolean {
        const confirm = this.passwordChange.controls['password_confirmation'];
        const password = this.passwordChange.controls['password'];
        if (this.passwordChange.errors && ((confirm.touched || confirm.dirty) || (password.touched || password.dirty))) {
            return this.passwordChange.errors.mismatch;
        } else {
            return false;
        }
    }

    getErrors(form: FormGroup, key: string) {
        if (this.inputValidation(form, key) || (key === 'password_confirmation' && this.passwordsMismatch())) {
            const formErrors = form.controls[key].errors;
            const errors = [];
            switch (key) {
                case 'firstname':
                    formErrors.required ? errors.push('Please enter your first name') : null;
                    formErrors.pattern ? errors.push('Please enter correct first name') : null;
                    break;
                case 'lastname':
                    formErrors.pattern ? errors.push('Please enter correct last name') : null;
                    break;
                case 'patronymic':
                    formErrors.pattern ? errors.push('Please enter correct patronymic') : null;
                    break;
                case 'phone':
                    formErrors.pattern ? errors.push('Please enter correct phone number') : null;
                    break;
                case 'email':
                    formErrors.required ? errors.push('Please enter your e-mail address') : null;
                    formErrors.pattern ? errors.push('Please enter correct e-mail address') : null;
                    break;
                case 'oldPassword':
                    formErrors.required ? errors.push('Please enter password') : null;
                    formErrors.minlength ? errors.push('Password is too short') : null;
                    // formErrors.response ? errors.push(formErrors.response) : null;
                    break;
                case 'password':
                    formErrors.required ? errors.push('Please enter password') : null;
                    formErrors.minlength ? errors.push('Password is too short') : null;
                    break;
                case 'password_confirmation':
                    formErrors && formErrors.required ? errors.push('Please enter password') : null;
                    formErrors && formErrors.minlength ? errors.push('Password is too short') : null;
                    !formErrors && this.passwordsMismatch() ? errors.push('Passwords don\'t match') : null;
                    break;
                case 'code':
                    formErrors.pattern ? errors.push('Please enter correct confirmation code') : null;
                    break;
            }
            const result = {};
            result[key] = errors;
            return result;
        }
        return this.service.errors;
    }


    dropHandler(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        this.uploadFiles(files[0]);
    }

    dragOverHandler(event): void {
        event.preventDefault();
    }

    dragEndHandler(event): void {}

    dragLeaveHandler(event): void {
        event.preventDefault();
    }

    private uploadFiles(file) {
        console.log(file);
        this.service.uploadFile(file, null, null).then(response => {
            if (response.avatar) {
                this.userDefaultPhoto = response.avatar;
                this.user.fetchProfileParams().then();
            }
        }).catch(() => {

        });
    }

    sendFile(event) {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            this.uploadFiles(file);
        }
    }

    selectFile() {
        this.fileInput.nativeElement.click();
    }
}
