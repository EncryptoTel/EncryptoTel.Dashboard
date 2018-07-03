import {Component, OnInit /*, ViewChildren*/} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {emailRegExp} from '../../../shared/vars';
import {ExtensionsServices} from '../../../services/extensions.services';
import {PhoneNumbersServices} from '../../../services/phone-numbers.services';
import {ActivatedRoute, Router} from '@angular/router';
import {ExtensionModel} from "../../../models/extension.model";

@Component({
    selector: 'add-extension-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [ExtensionsServices, PhoneNumbersServices]
})

export class AddExtensionsComponent implements OnInit {
    loading: number;
    mode = 'create';
    id: number;

    tab = {
        items: ['General', 'Voicemail', 'Forwarding Rules', 'Options', 'Rights', 'Privacy and Security'],
        icons: ['general_16px', 'voicemail_16px', 'forwarding_rules_16px_1', 'settings_16px', 'key_16px_3', 'security_16px'],
        select: 'General'
    };
    formExtension: FormGroup;
    accessList;

    constructor(private formBuilder: FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private _extension: ExtensionsServices) {
        this.id = activatedRoute.snapshot.params.id;
        this.id ? this.mode = 'edit' : this.mode = 'create';

        this.formExtension = this.formBuilder.group({
            outer: [null, [Validators.required]],
            phoneNumber: ['', [Validators.required]],
            default: false,
            user: this.formBuilder.group({
                firstName: ['', []],
                lastName: ['', []],
                email: ['', [Validators.pattern(emailRegExp)]]
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

    getExtension() {
        if (this.mode === 'create') {
            this.getAccessList(null);
            return;
        }
        this.loading += 1;
        this._extension.getExtension(this.id).then(res => {
            this.formExtension.get('outer').setValue(res.sipOuter.id);
            this.formExtension.get('phoneNumber').setValue(res.phoneNumber);
            this.formExtension.get('default').setValue(res.default);
            this.formExtension.get('mobileApp').setValue(res.mobileApp);
            this.formExtension.get('encryption').setValue(res.encryption);
            this.formExtension.get('toAdmin').setValue(false);
            this.formExtension.get('toUser').setValue(false);
            this.formExtension.get('callRecord').setValue(res.callRecord);
            this.formExtension.get('status').setValue(res.status);
            this.formExtension.get(['user', 'firstName']).setValue(res.user ? res.user.firstname : null);
            this.formExtension.get(['user', 'lastName']).setValue(res.user ? res.user.lastname : null);
            this.formExtension.get(['user', 'email']).setValue(res.user ? res.user.email : null);

            this.loading -= 1;
            this.getAccessList(res.user);
        }).catch(res => {
            this.loading -= 1;
        });
    }

    getAccessList(user) {
        this.loading += 1;
        this._extension.getAccessList(user ? user.id : null).then(res => {
            this.accessList = res;
            // console.log(this.accessList);
            this.loading -= 1;
        }).catch(res => {
            this.loading -= 1;
        });
    }

    doCancel() {
        this.router.navigate(['cabinet', 'extensions']);
    }

    doSave() {
        this.formExtension.markAsTouched();
        this.validate(this.formExtension);
        // console.log(this.formExtension.valid);
        if (this.formExtension.valid) {
            this.loading += 1;

            if (this.mode === 'create') {
                this._extension.create({...this.formExtension.value}).then(extension => {
                    this.id = extension.id;
                    this.afterSaveExtension(extension);
                }).catch(res => {
                    this.errorSaveExtension(res);
                });
            } else if (this.mode === 'edit') {
                this._extension.edit(this.id, {...this.formExtension.value}).then(extension => {
                    this.afterSaveExtension(extension);
                }).catch(res => {
                    this.errorSaveExtension(res);
                });
            }
        }
    }

    errorSaveExtension(res) {
        const errors = res.errors;
        if (errors) {
            Object.keys(errors).forEach(key => {
                this.formExtension.get(key).setErrors(errors[key]);
            });
        }
        this.loading -= 1;
    }

    afterSaveExtension(extension: ExtensionModel) {
        this.loading -= 1;
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

        this.loading += 1;
        this._extension.saveAccessList(extension.user.id, rights).then(res => {
            // console.log(res);
            this.loading -= 1;
            this.doCancel();
        }).catch(res => {
            this.loading -= 1;
            // console.log(res);
        });
    }

    ngOnInit(): void {
        this.loading = 0;
        this.getExtension();
        // this.getSipOuters();
    }
}
