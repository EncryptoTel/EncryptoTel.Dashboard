import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../../../../services/settings.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {emailRegExp, nameRegExp} from '../../../../shared/vars';
import {validateForm} from '../../../../shared/shared.functions';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {passwordConfirmation} from '../../../../shared/password-confirmation';
import {Router} from '@angular/router';
import {MessageServices} from "../../../../services/message.services";

@Component({
    selector: 'profile-component',
    templateUrl: './template.html',
    styleUrls: ['../local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class ProfileComponent implements OnInit {

    loading = {
        buttons: false,
        body: false,
        email: false,
        password: false
    };

    messageSent: boolean;

    generalForm: FormGroup;
    emailChange: FormGroup;
    passwordChange: FormGroup;

    initialEmail: string;

    numberRegExp: RegExp = new RegExp(/^\d+$/);
    phoneRegExp: RegExp = new RegExp(/^([\+]|[1-9]{1}|\+[1-9]{1})?[(]{0,1}[0-9]{1,3}[)]{0,1}[0-9]*$/g);

    constructor(private service: SettingsService,
                private router: Router,
                private message: MessageServices) {
    }

    inputValidation = (form: FormGroup, name: string, errorType?: string): boolean => {
        if (errorType) {
            const field = form.controls[name];
            return field && field.errors[errorType] && (field.dirty || field.touched);
        } else {
            const field = form.controls[name];
            return field && field.invalid && (field.dirty || field.touched);
        }
    }

    passwordsMismatch(): boolean {
        const confirm = this.passwordChange.controls['password_confirmation'];
        const password = this.passwordChange.controls['password'];
        if (this.passwordChange.errors && ((confirm.touched || confirm.dirty) || (password.touched || password.dirty))) {
            return this.passwordChange.errors.mismatch;
        } else {
            return false;
        }
    }

    initForms(): void {
        this.generalForm = new FormGroup({
            'firstname': new FormControl('', [
                Validators.required,
                Validators.pattern(nameRegExp)
            ]),
            'lastname': new FormControl('', [
                Validators.pattern(nameRegExp)
            ]),
            'patronymic': new FormControl('', [
                Validators.pattern(nameRegExp)
            ]),
            'phone': new FormControl('', [
                Validators.pattern(this.phoneRegExp)
            ])
        });
        this.emailChange = new FormGroup({
            'email': new FormControl('', [
                Validators.required,
                Validators.pattern(emailRegExp)
            ]),
            'code': new FormControl('', [
                Validators.required,
                Validators.minLength(6),
                Validators.pattern(this.numberRegExp)
            ])
        });
        this.passwordChange = new FormGroup({
            'oldPassword': new FormControl('', [
                Validators.required,
                Validators.minLength(6)
            ]),
            'password': new FormControl('', [
                Validators.required,
                Validators.minLength(6)
            ]),
            'password_confirmation': new FormControl('', [
                Validators.required,
                Validators.minLength(6)
            ]),
        }, passwordConfirmation);
    }

    goBack(): void {
        this.router.navigateByUrl('/cabinet/settings');
    }

    getSettings(): void {
        this.loading.body = true;
        this.service.getProfileSettings()
            .then(res => {
                this.initialEmail = res.profile.user.email;
                Object.keys(this.generalForm.controls).map(key => {
                    if (res.profile.user.hasOwnProperty(key)) {
                        this.generalForm.controls[key].setValue(res.profile.user[key] || null);
                    }
                });
                this.emailChange.controls.email.setValue(res.profile.user.email);
                this.loading.body = this.loading.buttons = false;
                this.passwordChange.reset();
            }).catch();
    }

    saveSettings(ev?: Event): void {
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        validateForm(this.generalForm);
        if (this.generalForm.valid) {
            this.loading.buttons = true;
            validateForm(this.generalForm);
            if (this.generalForm.valid) {
                this.service.saveProfileSettings(this.generalForm.value)
                    .then(() => {
                        this.getSettings();
                    })
                    .catch(() => this.loading.buttons = false);
            }
        }
    }

    initEmailChange(): void {
        // validateForm(this.emailChange);
        if (!this.messageSent) {
            if (!this.inputValidation(this.emailChange, 'email')) {
                this.loading.email = true;
                this.service.resetErrors();
                this.service.requestEmailChange(this.emailChange.get('email').value)
                    .then(res => {
                        this.messageSent = true;
                        this.loading.email = false;
                        this.message.writeSuccess(res.message);
                    }).catch(() => {
                        this.loading.email = false;
                });
            }
        } else {
            if (!this.inputValidation(this.emailChange, 'code')) {
                this.loading.email = true;
                this.service.confirmEmailChange(this.emailChange.get('code').value).then(res => {
                    this.initialEmail = this.emailChange.controls.email.value;
                    this.messageSent = false;
                    this.loading.email = false;
                    this.emailChange.get('code').setValue('');
                    this.message.writeSuccess(res.message);
                }).catch(res => {
                    this.loading.email = false;
                });
            }
        }
    }

    changePassword(): void {
        validateForm(this.passwordChange);
        if (this.passwordChange.valid) {
            this.loading.password = true;
            this.service.changePassword(this.passwordChange.value).then((res) => {
                this.passwordChange.reset();
                this.loading.password = false;
                this.message.writeSuccess(res.message);
            }).catch(res => {
                this.loading.password = false;
            });
        }
    }

    getErrors(form: FormGroup, key: string) {
        if (this.inputValidation(form, key) || (key === 'password_confirmation' && this.passwordsMismatch())) {
            let formErrors = form.controls[key].errors;
            let errors = [];
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
            let result = {};
            result[key] = errors;
            return result;
        }
        return this.service.errors;
    }

    ngOnInit() {
        this.initForms();
        this.getSettings();
    }
}
