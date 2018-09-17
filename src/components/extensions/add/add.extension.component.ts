import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {emailRegExp} from '../../../shared/vars';
import {ExtensionService} from '../../../services/extension.service';
import {PhoneNumberService} from '../../../services/phone-number.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ExtensionItem} from '../../../models/extension.model';
import { FormBaseComponent } from '../../../elements/pbx-form-base-component/pbx-form-base-component.component';

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

    tab = {
        items: [ 'General', 'Voicemail', 'Forwarding Rules', 'Options', 'Rights', 'Privacy and Security' ],
        icons: [ 'general_16px', 'voicemail_16px', 'forwarding_rules_16px_1', 'settings_16px', 'key_16px_3', 'security_16px' ],
        select: 'General',
        active: [ true, false, false, true, false, false ]
    };
    
    get formExtension(): FormGroup {
        return this.form;
    }

    set formExtension(form: FormGroup) {
        this.form = form;
    }

    accessList;

    constructor(protected _fb: FormBuilder,
                private _router: Router,
                private _activatedRoute: ActivatedRoute,
                private _extension: ExtensionService) {
        super(_fb);

        this.id = _activatedRoute.snapshot.params.id;
        this.id ? this.mode = 'edit' : this.mode = 'create';
    }

    initForm(): void {
        this.formExtension = this._fb.group({
            outer: [ null, [ Validators.required ] ],
            phoneNumber: [ null, [ Validators.required, Validators.minLength(3), Validators.maxLength(3) ] ],
            default: false,
            user: this._fb.group({
                firstName: [ null, [] ],
                lastName: [ null, [] ],
                email: [ null, [ Validators.pattern(emailRegExp) ] ]
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
            this.formExtension.get('toAdmin').setValue(true);
            this.getAccessList(null);
            return;
        }
        
        this.locker.lock();
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

            if (!res.user.email) {
                this.tab.active[4] = false;
            } else {
                this.tab.active[4] = true;
            }

            this.getAccessList(res.user);
        }).catch(() => {})
            .then(() => this.locker.unlock());
    }

    getAccessList(user) {
        this.locker.lock();
        this._extension.getAccessList(user ? user.id : null).then(res => {
            this.accessList = res;
        }).catch(() => {})
            .then(() => this.locker.unlock());
    }

    doCancel() {
        this._router.navigate(['cabinet', 'extensions']);
    }

    doSave() {
        this.formExtension.markAsTouched();
        this.validate(this.formExtension);
        if (this.formExtension.valid) {
            
            this.locker.lock();
            if (this.mode === 'create') {
                this._extension.create({...this.formExtension.value}).then(extension => {
                    this.id = extension.id;
                    this.afterSaveExtension(extension);
                    this._router.navigate(['cabinet', 'extensions', this.id]);
                }).catch(res => {
                    this.errorSaveExtension(res);
                });
            }
            else if (this.mode === 'edit') {
                this._extension.edit(this.id, {...this.formExtension.value}).then(extension => {
                    this.afterSaveExtension(extension);
                    if (extension.extension) {
                        this.getAccessList(extension.user);
                    }
                }).catch(res => {
                    this.errorSaveExtension(res);
                });
            }
        }
    }

    errorSaveExtension(res) {
        // console.log(res);
        const errors = res ? res.errors : null;
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
        for (let i = 0; i < this.accessList.length; i ++) {
            if (this.accessList[i].userStatus) {
                rights.push({id: this.accessList[i].id});
            }
        }

        this.locker.lock();
        this._extension.saveAccessList(extension.user.id, rights).then(() => {
            if (this.mode === 'create') this.doCancel();
        }).catch(() => {})
          .then(() => this.locker.unlock());
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getExtension();
        // this.getSipOuters();
    }
}
