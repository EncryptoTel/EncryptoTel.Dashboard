import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {emailRegExp} from '../../../../shared/vars';
import {ExtensionsServices} from '../../../../services/extensions.services';
import {PhoneNumbersServices} from '../../../../services/phone-numbers.services';
import {MessageServices} from "../../../../services/message.services";

@Component({
    selector: 'general-add-extension-component',
    templateUrl: './template.html',
    styleUrls: ['./../local.sass']
})

export class GeneralAddExtensionComponent implements OnInit {
    @Input() form: any;
    @Input() id: number;
    loading: number;
    sipOuters = {
      option: [],
      selected: null,
      isOpen: false
    };
    ext_phone = {
      option: [{title: 'outer 1'}, {title: 'outer 2'}, {title: 'outer 3'}, {title: 'outer 4'}],
      selected: null,
      isOpen: false
    };
    modal = {
        visible: false,
        title: '',
        text: '',
        confirm: {type: 'error', value: 'Delete'},
        decline: {type: 'cancel', value: 'Cancel'}
    };

    @ViewChildren('label') labelFields;
    constructor(private _numbers: PhoneNumbersServices,
                private _extensions: ExtensionsServices,
                private _messages: MessageServices) {}

    toggleHighlightLabel(event): void {
        event.target.labels[0].classList.toggle('active');
    }
    changeCheckbox(text: string): void {
        this.form.get(text).setValue(!this.form.get(text).value);
    }
    selectPhone(phone): void {
        this.sipOuters.selected = phone;
        this.form.get('outer').setValue(phone.id);
    }
    selectExternal(phone): void {
        this.ext_phone.selected = phone;
        this.form.get('external').setValue(phone.title);
    }
    sendPassword(): void {
        this.showModal('Reset password', 'Do you want to reset password and send new password to selected users?', 'Reset');
    }

    getSipOuters() {
        this.loading += 1;
        this._numbers.getSipOuters().then(res => {
            res['items'].map(number => {
                this.sipOuters.option.push({id: number.id, title: number.phoneNumber});
            });
            // this.sipOuters.selected = this.findById(this.form.get('outer').value, this.sipOuters.option);
            this.sipOuters.selected = this.sipOuters.option.find(item => item.id === this.form.get('outer').value);
            this.loading -= 1;
        });
    }

    private validate(form: FormGroup): void {
        Object.keys(form.controls).forEach(control => {
            if (form.get(control) instanceof FormArray) {
                const ctrl = form.get(control) as FormArray;
                ctrl.controls.forEach(cont => {
                    const ctr = cont as FormGroup;
                    ctr.markAsTouched();
                    Object.keys(ctr.controls).forEach(c => {
                        ctr.get(c).markAsTouched();
                    });
                });
            } else {
                form.get(control).markAsTouched();
            }
        });
    }

    findById(id: number, array: any): object {
      for (let i = 0; i < array.length; i++) {
        if (array[i]['id'] === id) {
          return array[i]; }}
      return null;
    }

    showModal(title: string, text: string, confirm: string): void {
        // console.log('showModal');
        this.modal.text = text;
        this.modal.title = title;
        this.modal.confirm.value = confirm;
        this.modal.visible = true;
    }

    getValue(name: string) {
        return this.form.get(name).value;
    }

    confirmModal() {
        this._extensions.changePassword(this.id, {
            mobileApp: this.getValue('mobileApp'),
            toAdmin: this.getValue('toAdmin'),
            toUser: this.getValue('toUser')}).then(res => {
                this._messages.writeSuccess(res.message);
        });
    }

    cancelModal() {

    }


    /* doSave() {
        this.form.markAsTouched();
        this.validate(this.form);
        // console.log(this.formGeneral.valid);
        if (this.form.valid) {
            this.loading += 1;
            if (this.mode === 'create') {
                this._extensions.save({...this.formGeneral.value}).then(() => {
                    this.loading -= 1;
                    this.router.navigate(['cabinet', 'extensions']);
                }).catch(res => {
                    const errors = res.errors;
                    if (errors) {
                        Object.keys(errors).forEach(key => {
                            this.formGeneral.get(key).setErrors(errors[key]);
                        });
                    }
                    this.loading -= 1;
                });
                // } else if (this.mode === 'edit') {
                //     this._service.edit(this.currentContact.id, {...this.formGeneral.value}).then(() => {
                //         this.getContacts();
                //         this.resetForm();
                //         this.loading = false;
                //     }).catch(err => {
                //         console.error(err);
                //         this.loading = false;
                //     });
            }
        }
    } */
    ngOnInit(): void {
        // console.log(this.id);
        this.loading = 0;
        this.getSipOuters();
    }
}
