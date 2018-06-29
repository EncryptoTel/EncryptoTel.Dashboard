import {Component, OnInit /*, ViewChildren*/} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {emailRegExp} from '../../../shared/vars';
import {ExtensionsServices} from '../../../services/extensions.services';
import {PhoneNumbersServices} from '../../../services/phone-numbers.services';
import {ActivatedRoute, Router} from '@angular/router';

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
        items: ['General', 'Forwarding Rules', 'Options', 'Rights'],
        select: 'General'
    };
    formExtension: FormGroup;

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

            // voiceEmnable: false,
            // voicePlayCaller: false,
            // voiceLanguage: [null, [Validators.required]],
            // voiceRead: [null, [Validators.required]],
            //
            // optionDisExt: false,
            // optionDisCalls: false,
            // optionRecAll: false,
            // optionSendNotification: false,
            // optionConferences: false,
            //
            // rightsRole: false,
            // rightsWebAccess: false,
            // rightsCallReports: false,
            // rightsDownloadRec: false,
            // rightsPhoneNumbers: false,
            // rightsCallRules: false,
            // rightsQueue: false,
            // rightsIVR: false,
            // rightsCompany: false,
            // rightsDepartment: false,
            // rightsDetailsRecords: false,
            // rightsInvoices: false,
            // rightsMarketplace: false,
            // rightsStorage: false,
            //
            // PrivacyChangeEvery: [null, [Validators.required]],
        });
    }

    selectTab(text: string): void {
        this.tab.select = text;
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
            return;
        }
        this.loading += 1;
        this._extension.getExtension(this.id).then(res => {
            this.formExtension.get('outer').setValue(res.sipOuter.id);
            this.formExtension.get('phoneNumber').setValue(res.phoneNumber);
            this.formExtension.get('default').setValue(res.default);
            this.formExtension.get('mobileApp').setValue(res.mobileApp);
            this.formExtension.get('encryption').setValue(res.encryption);
            this.formExtension.get(['user', 'firstName']).setValue(res.user ? res.user.firstname : null);
            this.formExtension.get(['user', 'lastName']).setValue(res.user ? res.user.lastname : null);
            this.formExtension.get(['user', 'email']).setValue(res.user ? res.user.email : null);

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
                this._extension.create({...this.formExtension.value}).then(() => {
                    this.loading -= 1;
                    this.router.navigate(['cabinet', 'extensions']);
                }).catch(res => {
                        const errors = res.errors;
                        if (errors) {
                            Object.keys(errors).forEach(key => {
                                this.formExtension.get(key).setErrors(errors[key]);
                            });
                        }
                        this.loading -= 1;
                    }
                );
            } else if (this.mode === 'edit') {
                this._extension.edit(this.id, {...this.formExtension.value}).then(() => {
                    this.doCancel();
                    this.loading -= 1;
                }).catch(err => {
                    // console.error(err);
                    this.loading -= 1;
                });
            }
        }
    }

    ngOnInit(): void {
        this.loading = 0;
        this.getExtension();
        // this.getSipOuters();
    }
}
