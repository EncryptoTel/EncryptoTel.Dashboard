import { Component, Input, OnInit, ViewChildren, ViewChild } from '@angular/core';

import { RefsServices } from '@services/refs.services';
import { MessageServices } from '@services/message.services';
import { ExtensionService } from '@services/extension.service';
import { Locker, Lockable } from '@models/locker.model';
import { ValidationHost } from '@models/validation-host.model';
import { ModalEx } from '@elements/pbx-modal/pbx-modal.component';


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
    certificateFile: any;
    extNumber: any;

    @Input() certificateId: number;
    @Input() form: any;
    @Input() encryption: boolean;
    @Input() id: number;
    @Input() service;
    @Input() storageService;
    @Input() validationHost: ValidationHost;

    @ViewChildren('label') labelFields;

    // -- component lifecycle methods -----------------------------------------

    constructor(public extensions: ExtensionService,
        private messages: MessageServices,
        private refs: RefsServices) {
        this.sipOuters = {
            option: [],
            selected: null,
            isOpen: false
        };
        this.locker = new Locker();
        this.modal = new ModalEx('', 'resetToSelected');
    }

    ngOnInit(): void {
        this.getSipOuters();
        this.getExtensionPhoneNumber();
        this.getCertificate();
    }

    // -- event handlers ------------------------------------------------------

    sendPassword(): void {
        this.modal.visible = true;
    }

    confirmModal() {
        this.passwordLoading++;
        this.extensions.changePassword(this.id, {
                mobileApp: this.getFormValue('mobileApp'),
                toAdmin: this.getFormValue('toAdmin'),
                toUser: this.getFormValue('toUser')
            })
            .then(response => {
                this.messages.writeSuccess(response.message);
            })
            .catch(() => {})
            .then(() => this.passwordLoading--);
    }

    cancelModal() {
    }

    // -- component methods ---------------------------------------------------

    changeCheckbox(text: string): void {
        this.form.get(text).setValue(!this.form.get(text).value);
    }

    getFormValue(name: string) {
        return this.form.get(name).value;
    }

    isEmailRequired(): boolean {
        // return !!this.form.controls.user.get('firstName').value
        //        || !!this.form.controls.user.get('lastName').value;
        return !!this.form.controls.user.get('email').value && this.form.controls.user.get('email').valid;
    }

    // -- data retrieval methods ----------------------------------------------

    getSipOuters() {
        this.locker.lock();
        this.refs.getInnerSipOuters().then(response => {
            response.map(number => {
                this.sipOuters.option.push({ id: number.id, title: number.phoneNumber });
            });
            this.sipOuters.selected = this.sipOuters.option.find(item => item.id === this.form.get('outer').value.id);
        }).catch(() => {
        }).then(() => this.locker.unlock());
    }

    getExtensionPhoneNumber() {
        this.extensions.getExtensionNumber().then(response => {
            this.extNumber = response.inner;
            const phoneNumber = this.form.get('phoneNumber').value;
            if (phoneNumber === null) {
                this.form.get('phoneNumber').setValue(this.extNumber);
            }
        }).catch(() => {
        }).then(() => {
        });
    }

    getCertificate() {
        if (this.certificateId) {
            this.storageService.getById(this.certificateId).then(response => {
                this.certificateFile = response;
            }).catch(() => {
            }).then(() => this.locker.unlock());
        }
    }

    newLink(event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (this.certificateId) {
            this.storageService.getById(this.certificateId).then(response => {
                this.certificateFile = response;
            }).catch().then();
        }
    }

}
