import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../../../../services/settings.service';
import {FormControl, FormGroup, Validators, FormBuilder} from '@angular/forms';
import {emailRegExp, nameRegExp, phoneRegExp, numberRegExp} from '../../../../shared/vars';
import {validateForm, killEvent} from '../../../../shared/shared.functions';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {passwordConfirmation} from '../../../../shared/password-confirmation';
import {Router} from '@angular/router';
import {MessageServices} from '../../../../services/message.services';
import {UserServices} from '../../../../services/user.services';
import {FormsSnapshots} from '../../../../models/forms-snapshots.model';


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
export class ProfileComponent implements OnInit {
    generalForm: FormGroup;
    emailChange: FormGroup;
    passwordChange: FormGroup;
    formSnapshots: FormsSnapshots;

    emailChangeState: EmailChangeState;
    get messageSent(): boolean {
        return this.emailChangeState == EmailChangeState.CONFIRMATION_CODE_SENT;
    }

    loading: number;
    saveButton: any;

    // --- component lifecycle methods ----------------------------------------

    constructor(private _service: SettingsService,
                private _fb: FormBuilder,
                private _router: Router,
                private _message: MessageServices,
                private _user: UserServices) {
        this.loading = 0;
        this.formSnapshots = new FormsSnapshots();
        this.emailChangeState = EmailChangeState.NOT_STARTED;
        this.saveButton = { buttonType: 'success', value: 'Save', inactive: false, loading: false };
    }

    ngOnInit() {
        this.initForms();
        this.getSettings();
    }
    
    // --- initialization -----------------------------------------------------

    initForms(): void {
        this.generalForm = this._fb.group({
            firstname:  [null, [ Validators.required, Validators.pattern(nameRegExp) ]],
            lastname:   [null, [ Validators.pattern(nameRegExp) ]],
            patronymic: [null, [ Validators.pattern(nameRegExp) ]],
            phone:      [null, [ Validators.pattern(phoneRegExp), Validators.minLength(7), Validators.maxLength(16) ]]
        });
        this.formSnapshots.add('generalForm', this.generalForm);
        
        this.emailChange = this._fb.group({
            email:  [null, [ Validators.required, Validators.pattern(emailRegExp) ]],
            code:   [null, [ Validators.required, Validators.minLength(6), Validators.pattern(numberRegExp) ]],
        });
        this.formSnapshots.add('emailChange', this.emailChange);
        
        this.passwordChange = this._fb.group({
            oldPassword:            [null, [ Validators.required, Validators.minLength(6) ]],
            password:               [null, [ Validators.required, Validators.minLength(6) ]],
            password_confirmation:  [null, [ Validators.required, Validators.minLength(6) ]],
        }, { 
                validator: (formGroup: FormGroup) => {
                    return passwordConfirmation(formGroup);
                }
        });
        this.formSnapshots.add('passwordChange', this.passwordChange);
    }

    // --- event handlers -----------------------------------------------------

    back(): void {
        this._router.navigateByUrl('/cabinet/settings');
    }

    change() {
        validateForm(this.generalForm);
        // this.saveButton.inactive = !this.generalForm.valid;
    }

    save(event?: Event): void {
        killEvent(event);
        let validationResult = true;

        const profileFormChanged = this.formSnapshots.check('generalForm');
        // console.log('generalForm', profileFormChanged);
        if (profileFormChanged) {
            validateForm(this.generalForm);
            validationResult = validationResult && this.generalForm.valid;
        }

        const emailFormChanged = this.formSnapshots.check('emailChange');
        // console.log('emailChanged', emailFormChanged);
        if (emailFormChanged) {
            validationResult = validationResult && this.validateEmailForm();
        }

        const passwordFormChanged = this.formSnapshots.check('passwordChange');
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
        this.formSnapshots.save(formKey);
    }

    // checkFormChanged(formKey: string, form: FormGroup): boolean {
    //     if (!this.formSnapshots[formKey]) 
    //         return true;
    //     return JSON.stringify(form.value) != this.formSnapshots[formKey];
    // }

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

    getSettings(): void {
        this.loading ++;

        this._service.getProfileSettings().then(response => {
            // console.log('profile', response);

            this.initFormData('generalForm', this.generalForm, response);
            this.initFormData('emailChange', this.emailChange, response);
            this.initFormData('passwordChange', this.passwordChange);

            this.loading --;
        });
    }

    saveProfileSettings(): void {
        this.loading ++;
        this._service.saveProfileSettings(this.generalForm.value).then(() => {
            this.getSettings();
            this._user.fetchProfileParams().then();
            this.loading --;
        })
        .catch(() => this.loading --);
    }

    saveEmailSettings(): void {
        if (this.emailChangeState == EmailChangeState.NOT_STARTED) {
            this.loading ++;
            // this._service.resetErrors();
            this._service.requestEmailChange(this.emailChange.get('email').value).then(response => {
                this.emailChangeState = EmailChangeState.CONFIRMATION_CODE_SENT;
                
                this.loading --;
                // this._message.writeSuccess(response.message);
            }).catch(() => {
                this.loading --;
            });
        }
        else if (this.emailChangeState == EmailChangeState.CONFIRMATION_CODE_SENT) {
            this.loading ++;
            this._service.confirmEmailChange(this.emailChange.get('code').value).then(response => {
                this.emailChange.get('code').setValue('');
                this.formSnapshots.save('emailChange');
                this.emailChangeState = EmailChangeState.NOT_STARTED;
                
                this.loading --;
                // this._message.writeSuccess(response.message);
            }).catch(() => {
                this.loading --;
            });
        }
    }

    savePasswordSettings(): void {
        this.loading ++;
        this._service.changePassword(this.passwordChange.value).then(response => {
            this.passwordChange.reset();
            
            this.loading --;
            // this._message.writeSuccess(response.message);
        }).catch(() => {
            this.loading --;
        });
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
        return this._service.errors;
    }
}
