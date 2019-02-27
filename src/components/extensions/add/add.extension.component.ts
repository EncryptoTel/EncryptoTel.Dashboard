import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { emailRegExp, callRuleNameRegExp, numberRegExp } from '@shared/vars';
import { ExtensionService } from '@services/extension.service';
import { PhoneNumberService } from '@services/phone-number.service';
import { ExtensionItem } from '@models/extension.model';
import { FormBaseComponent } from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import { MessageServices } from '@services/message.services';
import { StorageService } from '@services/storage.service';


export const reEmailExists: RegExp = new RegExp(/^such record (.+) already exists.$/i);

@Component({
  selector: 'add-extension-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [ExtensionService, PhoneNumberService]
})
export class AddExtensionsComponent extends FormBaseComponent implements OnInit {
  // loading: number;
  mode = 'create';
  id: number;
  background: string;
  encryption: boolean = false;
  certificateId: number = undefined;
  accessList;
  // flag is in true when email become required and turns off when email is not required
  emailRequiredFlag: boolean = false;

  tab = {
    items: ['General', 'Voicemail', 'Forwarding Rules'],
    icons: ['general_16px', 'voicemail_16px', 'forwarding_rules_16px_1'],
    select: 'General',
    active: [true, false, false, true, false, false]
  };

  get formExtension(): FormGroup {
    return this.form;
  }

  set formExtension(form: FormGroup) {
    this.form = form;
  }

  get isEmailRequired(): boolean {
    const formValue: any = this.formExtension.value;
    return !!formValue.user &&
      (!!formValue.user.firstName || !!formValue.user.lastName);
  }

  get modelEdit(): boolean {
    return this.mode === 'edit';
  }

  constructor(
    protected fb: FormBuilder,
    protected message: MessageServices,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private extension: ExtensionService,
    protected storageService: StorageService,
    protected translate: TranslateService,
  ) {
    super(fb, message, translate);

    this.background = 'form-body-fill';
    this.id = this.activatedRoute.snapshot.params.id;
    this.id ? this.mode = 'edit' : this.mode = 'create';

    this.validationHost.customMessages = [
      { key: 'outer', error: 'required', message: this.translate.instant('Please choose a phone number') },
      { key: 'phoneNumber', error: 'pattern', message: this.translate.instant('Extension can contain 3 numbers only') },
      { key: 'phoneNumber', error: 'minlength', message: this.translate.instant('Extension can contain 3 numbers only') },
      { key: 'phoneNumber', error: 'maxlength', message: this.translate.instant('Extension can contain 3 numbers only') },
      { key: 'phoneNumber', error: 'min', message: this.translate.instant('Your extension must be over 100') },
      { key: 'user.firstName', error: 'maxlength', message: this.translate.instant('First name can\'t contain over of 190 characters') },
      { key: 'user.firstName', error: 'pattern', message: this.translate.instant('First name contains invalid characters. You can only use letters, numbers and the following symbols: -_.') },
      { key: 'user.lastName', error: 'maxlength', message: this.translate.instant('Last name can\'t contain over of 190 characters') },
      { key: 'user.lastName', error: 'pattern', message: this.translate.instant('Last name contains invalid characters. You can only use letters, numbers and the following symbols: -_.') },
      { key: 'user.email', error: 'required', message: this.translate.instant('Please enter email address') },
      { key: 'user.email', error: 'pattern', message: this.translate.instant('Please enter correct email address') },
    ];
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getExtension();
    // this.getSipOuters();
  }

  initForm(): void {
    this.formExtension = this.fb.group({
      outer: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required, Validators.pattern(numberRegExp), Validators.minLength(3), Validators.maxLength(3), Validators.min(100)]],
      default: false,
      user: this.fb.group({
        firstName: [null, [Validators.minLength(1), Validators.maxLength(190), Validators.pattern(callRuleNameRegExp)]],
        lastName: [null, [Validators.minLength(1), Validators.maxLength(190), Validators.pattern(callRuleNameRegExp)]],
        email: [null, [Validators.pattern(emailRegExp)]]
      }),
      mobileApp: false,
      encryption: false,
      toAdmin: false,
      toUser: false,
      callRecord: false,
      status: true
    });

    this.formExtension.valueChanges.subscribe(() => {
      if (this.isEmailRequired && !this.emailRequiredFlag) {
        this.emailRequiredFlag = true;

        const ctrl = this.form.get(['user', 'email']);
        ctrl.setValidators([Validators.required, Validators.pattern(emailRegExp)]);
        ctrl.updateValueAndValidity();
        ctrl.markAsUntouched();
      }

      if (!this.isEmailRequired && this.emailRequiredFlag) {
        this.emailRequiredFlag = false;

        const ctrl = this.form.get(['user', 'email']);
        ctrl.setValidators([Validators.pattern(emailRegExp)]);
        ctrl.updateValueAndValidity();
        ctrl.markAsUntouched();
      }
    });
  }

  selectTab(text: string): void {
    this.tab.select = text;
  }

  canActivateTab(item): boolean {
    if (item === 'Rights') {
      return this.formExtension.get(['user', 'email']).value !== '' && !this.formExtension.get(['user', 'email']).invalid;
    } else {
      return true;
    }
  }

  getExtension() {
    if (this.mode === 'create') {
      this.formExtension.get('toAdmin').setValue(true);
      this.getAccessList(null);
      this.saveFormState();
      return;
    }

    this.locker.lock();
    this.extension.getExtension(this.id)
      .then(response => {
        this.formExtension.get('outer').setValue({
          id: response.sipOuter.id,
          title: response.sipOuter.phoneNumber
        });

        this.formExtension.get('phoneNumber').setValue(response.phoneNumber);
        this.formExtension.get('default').setValue(response.default);
        this.formExtension.get('mobileApp').setValue(response.mobileApp);
        this.formExtension.get('encryption').setValue(response.encryption);
        this.encryption = response.encryption;
        if (response.certificate) {
          this.certificateId = response.certificate;
        }
        this.formExtension.get('toAdmin').setValue(false);
        this.formExtension.get('toUser').setValue(false);
        this.formExtension.get('callRecord').setValue(response.callRecord);
        this.formExtension.get('status').setValue(response.status);

        this.formExtension.get(['user', 'firstName']).setValue(response.user ? response.user.firstname : null);
        this.formExtension.get(['user', 'lastName']).setValue(response.user ? response.user.lastname : null);
        this.formExtension.get(['user', 'email']).setValue(response.user ? response.user.email : null);

        if (!response.user.email) {
          this.tab.active[4] = false;
        } else {
          this.tab.active[4] = true;
        }

        this.getAccessList(response.user);
      })
      .catch(() => { })
      .then(() => {
        this.saveFormState();
        this.locker.unlock();
      });
  }

  getAccessList(user) {
    this.locker.lock();
    this.extension.getAccessList(user ? user.id : null)
      .then(response => {
        this.accessList = response;
      })
      .catch(() => { })
      .then(() => this.locker.unlock());
  }

  close(): void {
    this.router.navigate(['cabinet', 'extensions']);
  }

  save() {
    this.validateForms();

    if (this.formExtension.valid) {
      this.locker.lock();

      if (this.mode === 'create') {
        this.extension.create({ ...this.formExtension.value })
          .then(extension => {
            const confirmation: string = this.translate
              .instant('Extension has been created successfully');
            this.message.writeSuccess(confirmation);

            this.id = extension.id;
            this.afterSaveExtension(extension);
            this.saveFormState();
            this.router.navigate(['cabinet', 'extensions']);
          })
          .catch(response => {
            this.errorSaveExtension(response);
          });
      }
      else if (this.mode === 'edit') {
        this.extension.edit(this.id, { ...this.formExtension.value })
          .then(extension => {
            const confirmation: string = this.translate
              .instant('The changes have been saved successfully');
            this.message.writeSuccess(confirmation);

            this.afterSaveExtension(extension);
            this.saveFormState();
            if (extension.extension) {
              this.getAccessList(extension.user);
            }
          })
          .catch(response => {
            this.errorSaveExtension(response);
          });
      }
    }
    else {
      this.scrollToFirstError();
    }
  }

  errorSaveExtension(response) {
    const errors = response ? response.errors : null;
    if (errors) {
      Object.keys(errors).forEach(key => {
        const obj = this.formExtension.get(key);
        if (obj) {
          this.translateErrors(errors[key]);
          obj.setErrors(errors[key]);
        }
      });
    }
    this.locker.unlock();
  }

  translateErrors(errors: any): void {
    errors.forEach((msg: string, i: number) => {
      if (reEmailExists.test(msg)) {
        const matches = reEmailExists.exec(msg);
        errors[i] = this.translate.instant('userEmailAlreadyExists', {email: matches[1]});
      } else {
        errors[i] = this.translate.instant(msg);
      }
    });
  }

  afterSaveExtension(extension: ExtensionItem) {
    if (!extension.user) {
      this.tab.active[4] = false;
    } else {
      this.tab.active[4] = true;
    }

    this.locker.unlock();

    if (!extension.user) {
      this.close();
      return;
    }

    const rights = [];
    for (let i = 0; i < this.accessList.length; i++) {
      if (this.accessList[i].userStatus) {
        rights.push({ id: this.accessList[i].id });
      }
    }

    this.locker.lock();
    this.extension.saveAccessList(extension.user.id, rights)
      .then(() => {
        if (this.mode === 'create') this.close();
      })
      .catch(() => { })
      .then(() => this.locker.unlock());
  }
}
