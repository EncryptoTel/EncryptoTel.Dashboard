import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {ExtensionService} from '../../../../services/extension.service';
import {PhoneNumberService} from '../../../../services/phone-number.service';
import {MessageServices} from '../../../../services/message.services';
import {RefsServices} from '../../../../services/refs.services';
import {ModalEx} from '../../../../elements/pbx-modal/pbx-modal.component';
import {Locker, Lockable} from '../../../../models/locker.model';
import {ValidationHost} from '../../../../models/validation-host.model';

@Component({
    selector: 'general-add-extension-component',
    templateUrl: './template.html',
    styleUrls: ['./../local.sass']
})

export class GeneralAddExtensionComponent implements OnInit, Lockable {
    sipOuters: any;
    // extPhone: any;

    locker: Locker;
    passwordLoading = 0;

    modal: ModalEx;

    @Input() form: any;
    @Input() id: number;
    @Input() service;
    @Input() validationHost: ValidationHost;

    @ViewChildren('label') labelFields;

    // -- component lifecycle methods -----------------------------------------

    constructor(private _numbers: PhoneNumberService,
                public _extensions: ExtensionService,
                private _messages: MessageServices,
                private refs: RefsServices) {
        this.sipOuters = {
            option: [],
            selected: null,
            isOpen: false
        };
        // this.extPhone = {
        //     option: [{title: 'outer 1'}, {title: 'outer 2'}, {title: 'outer 3'}, {title: 'outer 4'}],
        //     selected: null,
        //     isOpen: false
        // };
        this.locker = new Locker();
        this.modal = new ModalEx('', 'resetToSelected');
    }

    ngOnInit(): void {
        this.getSipOuters();
    }

    // -- event handlers ------------------------------------------------------

    sendPassword(): void {
        this.modal.visible = true;
    }

    confirmModal() {
        this.passwordLoading ++;
        this._extensions.changePassword(this.id, {
            mobileApp: this.getFormValue('mobileApp'),
            toAdmin: this.getFormValue('toAdmin'),
            toUser: this.getFormValue('toUser')
        }).then(response => {
            this._messages.writeSuccess(response.message);
        }).catch(() => {})
          .then(() => this.passwordLoading --);
    }

    cancelModal() {}

    // -- component methods ---------------------------------------------------

    changeCheckbox(text: string): void {
        this.form.get(text).setValue(!this.form.get(text).value);
    }

    selectPhone(phone): void {
        this.sipOuters.selected = phone;
        this.form.get('outer').setValue(phone.id);
    }

    getFormValue(name: string) {
        return this.form.get(name).value;
    }

    // -- data retrieval methods ----------------------------------------------

    getSipOuters() {
        this.locker.lock();
        this.refs.getSipOuters().then(response => {
            response.map(number => {
                this.sipOuters.option.push({id: number.id, title: number.phoneNumber});
            });
            this.sipOuters.selected = this.sipOuters.option.find(item => item.id === this.form.get('outer').value.id);
        }).catch(() => {})
          .then(() => this.locker.unlock());
    }
}
