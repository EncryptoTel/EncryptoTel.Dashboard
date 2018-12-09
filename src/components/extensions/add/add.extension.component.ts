import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {emailRegExp, nameRegExp} from '../../../shared/vars';
import {ExtensionService} from '../../../services/extension.service';
import {PhoneNumberService} from '../../../services/phone-number.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ExtensionItem} from '../../../models/extension.model';
import {FormBaseComponent} from '../../../elements/pbx-form-base-component/pbx-form-base-component.component';
import {validateForm} from '../../../shared/shared.functions';
import {MessageServices} from '../../../services/message.services';
import {StorageService} from '../../../services/storage.service';

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

    tab = {
        items: ['General', 'Voicemail', 'Forwarding Rules', 'Options', 'Privacy and Security'],
        icons: ['general_16px', 'voicemail_16px', 'forwarding_rules_16px_1', 'settings_16px', 'security_16px'],
        select: 'General',
        active: [true, false, false, true, false, false]
    };

    get formExtension(): FormGroup {
        return this.form;
    }

    set formExtension(form: FormGroup) {
        this.form = form;
    }

    accessList;

    constructor(protected fb: FormBuilder,
                protected message: MessageServices,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private extension: ExtensionService,
                private storageService: StorageService) {
        super(fb, message);

        this.background = 'form-body-fill';
        this.id = activatedRoute.snapshot.params.id;
        this.id ? this.mode = 'edit' : this.mode = 'create';

        this.validationHost.customMessages = [
            {name: 'First Name', error: 'pattern', message: 'Last Name contain only letters, \'-\', \'_\' and \'.\''},
            {name: 'Last Name', error: 'pattern', message: 'Last Name contain only letters, \'-\', \'_\' and \'.\''},
            {name: 'Email', error: 'pattern', message: 'Please enter valid email address'},
        ];
    }

    initForm(): void {
        this.formExtension = this.fb.group({
            outer: [null, [Validators.required]],
            phoneNumber: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
            default: false,
            user: this.fb.group({
                firstName: [null, [Validators.pattern(nameRegExp)]],
                lastName: [null, [Validators.pattern(nameRegExp)]],
                email: [null, [Validators.pattern(emailRegExp)]]
            }),
            mobileApp: false,
            encryption: false,
            toAdmin: false,
            toUser: false,
            callRecord: false,
            status: false
        });
    }

    selectTab(text: string): void {
        this.tab.select = text;
    }

    canActivateTab(item): boolean {
        if (item === 'Rights') {
            return this.formExtension.get(['user', 'email']).value != '' && !this.formExtension.get(['user', 'email']).invalid;
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
        this.extension.getExtension(this.id).then(response => {
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
        }).catch(() => {
        })
            .then(() => {
                this.saveFormState();
                this.locker.unlock();
            });
    }

    getAccessList(user) {
        this.locker.lock();
        this.extension.getAccessList(user ? user.id : null).then(res => {
            this.accessList = res;
        }).catch(() => {
        })
            .then(() => this.locker.unlock());
    }

    close(): void {
        super.close(this.mode == 'edit', () => this.doCancel());
    }

    doCancel(): void {
        this.router.navigate(['cabinet', 'extensions']);
    }

    doSave() {
        // this.formExtension.markAsTouched();
        validateForm(this.formExtension);

        if (this.formExtension.valid) {
            this.locker.lock();

            if (this.mode === 'create') {
                this.extension.create({...this.formExtension.value}).then(extension => {
                    this.id = extension.id;
                    this.afterSaveExtension(extension);
                    this.router.navigate(['cabinet', 'extensions']);
                }).catch(response => {
                    this.errorSaveExtension(response);
                });
            }
            else if (this.mode === 'edit') {
                this.extension.edit(this.id, {...this.formExtension.value}).then(extension => {
                    this.afterSaveExtension(extension);
                    if (extension.extension) {
                        this.getAccessList(extension.user);
                    }
                }).catch(response => {
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
                let obj = this.formExtension.get(key);
                if (obj) obj.setErrors(errors[key]);
            });
        }
        this.locker.unlock();
    }

    afterSaveExtension(extension: ExtensionItem) {
        if (!extension.user) {
            this.tab.active[4] = false;
        } else {
            this.tab.active[4] = true;
        }

        this.locker.unlock();

        if (!extension.user) {
            this.doCancel();
            return;
        }

        let rights = [];
        for (let i = 0; i < this.accessList.length; i++) {
            if (this.accessList[i].userStatus) {
                rights.push({id: this.accessList[i].id});
            }
        }

        this.locker.lock();
        this.extension.saveAccessList(extension.user.id, rights).then(() => {
            if (this.mode === 'create') this.doCancel();
        }).catch(() => {
        })
            .then(() => this.locker.unlock());
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getExtension();
        // this.getSipOuters();
    }
}
