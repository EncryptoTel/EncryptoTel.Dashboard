import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms';
import {ExtensionService} from '../../../../services/extension.service';
import {PhoneNumberService} from '../../../../services/phone-number.service';
import {MessageServices} from "../../../../services/message.services";
import {RefsServices} from "../../../../services/refs.services";
import {ModalEx} from "../../../../elements/pbx-modal/pbx-modal.component";

@Component({
    selector: 'general-add-extension-component',
    templateUrl: './template.html',
    styleUrls: ['./../local.sass']
})

export class GeneralAddExtensionComponent implements OnInit {
    @Input() form: any;
    @Input() id: number;
    @Input() service;
    loading: number = 0;
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
    modal = new ModalEx('', 'resetToSelected');
    passwordLoading = 0;

    @ViewChildren('label') labelFields;

    constructor(private _numbers: PhoneNumberService,
                public _extensions: ExtensionService,
                private _messages: MessageServices,
                private refs: RefsServices) {

    }

    changeCheckbox(text: string): void {
        this.form.get(text).setValue(!this.form.get(text).value);
    }

    selectPhone(phone): void {
        this.sipOuters.selected = phone;
        this.form.get('outer').setValue(phone.id);
    }

    sendPassword(): void {
        this.modal.visible = true;
    }

    getSipOuters() {
        this.loading++;
        this.refs.getSipOuters().then(res => {
            res.map(number => {
                this.sipOuters.option.push({id: number.id, title: number.phoneNumber});
            });
            // this.sipOuters.selected = this.findById(this.form.get('outer').value, this.sipOuters.option);
            this.sipOuters.selected = this.sipOuters.option.find(item => item.id === this.form.get('outer').value);
            this.loading--;
        }).catch(() => {
            this.loading--;
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
                return array[i];
            }
        }
        return null;
    }

    getValue(name: string) {
        return this.form.get(name).value;
    }

    confirmModal() {
        this.passwordLoading++;
        this._extensions.changePassword(this.id, {
            mobileApp: this.getValue('mobileApp'),
            toAdmin: this.getValue('toAdmin'),
            toUser: this.getValue('toUser')
        }).then(res => {
            this._messages.writeSuccess(res.message);
            this.passwordLoading--;
        }).catch(() => {
            this.passwordLoading--;
        });
    }

    cancelModal() {

    }

    ngOnInit(): void {
        this.getSipOuters();
    }

}
