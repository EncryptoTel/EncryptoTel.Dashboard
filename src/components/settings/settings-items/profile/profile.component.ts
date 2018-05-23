import {Component, OnInit} from '@angular/core';
import {SettingsServices} from '../../../../services/settings.services';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {emailRegExp, nameRegExp} from '../../../../shared/vars';
import {validateForm} from '../../../../shared/shared.functions';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {passwordConfirmation} from '../../../../shared/password-confirmation';
import {Router} from '@angular/router';

@Component({
  selector: 'profile-component',
  templateUrl: './template.html',
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
  emailCode = {
    code: '',
    error: ''
  };
  passwordChange: FormGroup;

  initialEmail: string;

  numberRegExp: RegExp = new RegExp(/^\d+$/);

  constructor(private _services: SettingsServices,
              private router: Router) {}

  inputValidation = (form: FormGroup, name: string, errorType?: string): boolean => {
    if (errorType) {
      const field = form.controls[name];
      return field && field.errors[errorType] && (field.dirty || field.touched);
    } else {
      const field = form.controls[name];
      return field && field.invalid && (field.dirty || field.touched);
    }
  }
  isCodeValid(): boolean {
    return (this.emailCode.code.length === 6 && this.numberRegExp.test(this.emailCode.code));
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
      ])
    });
    this.emailChange = new FormGroup({
      'email': new FormControl('', [
        Validators.pattern(emailRegExp)
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
    this._services.getProfileSettings()
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
        this._services.saveProfileSettings(this.generalForm.value)
          .then(() => {
            this.getSettings();
          })
          .catch(() => this.loading.buttons = false);
      }
    }
  }

  initEmailChange(): void {
    if (!this.messageSent) {
      validateForm(this.emailChange);
      if (this.emailChange.valid) {
        this.loading.email = true;
        this._services.requestEmailChange(this.emailChange.value)
          .then(res => {
            this.messageSent = true;
            this.loading.email = false;
          }).catch();
      }
    } else {
      if (this.isCodeValid()) {
        this.loading.email = true;
        this._services.confirmEmailChange(this.emailCode.code)
          .then(res => {
            this.initialEmail = this.emailChange.controls.email.value;
            this.messageSent = false;
            this.loading.email = false;
            this.emailCode.code = '';
          }).catch(res => {
            if (res.message) {
              this.emailCode.error = res.message;
              this.loading.email = false;
            }
        });
      }
    }
  }

  changePassword(): void {
    validateForm(this.passwordChange);
    if (this.passwordChange.valid) {
      this.loading.password = true;
      this._services.changePassword(this.passwordChange.value)
        .then(() => {
          this.passwordChange.reset();
          this.loading.password = false;
        }).catch(res => {
          const control = Object.keys(res.errors);
          for (const c of control) {
            this.passwordChange.controls[c].setErrors({response: res.errors[c].join('')});
          }
          this.loading.password = false;
      });
    }
  }

  ngOnInit() {
    this.initForms();
    this.getSettings();
  }
}
