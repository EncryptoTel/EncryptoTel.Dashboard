import {Component, OnInit /*, ViewChildren*/} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {emailRegExp} from '../../../shared/vars';
import {ExtensionsServices} from '../../../services/extensions.services';
import {PhoneNumbersServices} from '../../../services/phone-numbers.services';
import {Router} from '@angular/router';

@Component({
    selector: 'add-extension-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [ExtensionsServices, PhoneNumbersServices]
})

export class AddExtensionsComponent implements OnInit {
    loading: number;
    // mode = 'create';

    tab = {
        items: ['General', 'Voicemail', 'Forwarding Rules', 'Options', 'Rights', 'Privacy and Security'],
        select: 'General'
    };
    extentionform: FormGroup;
    constructor(
      private formBuilder: FormBuilder
    ) {
      this.extentionform = this.formBuilder.group({
        genOuter: [null, [Validators.required]],
        genPhoneNumber: ['', [Validators.required]],
        genDefault: false,
        user: this.formBuilder.group({
          firstname: ['', []],
          lastname: ['', []],
          email: ['', [Validators.pattern(emailRegExp)]]
        }),
        genMobile: '',
        genMobileApp: false,
        genEncrypted: false,
        genSendAdmin: false,
        genSendUser: false,

        voiceEmnable: false,
        voicePlayCaller: false,
        voiceLanguage: [null, [Validators.required]],
        voiceRead: [null, [Validators.required]],

        optionDisExt: false,
        optionDisCalls: false,
        optionRecAll: false,
        optionSendNotification: false,
        optionConferences: false,

        rightsRole: false,
        rightsWebAccess: false,
        rightsCallReports: false,
        rightsDownloadRec: false,
        rightsPhoneNumbers: false,
        rightsCallRules: false,
        rightsQueue: false,
        rightsIVR: false,
        rightsCompany: false,
        rightsDepartment: false,
        rightsDetailsRecords: false,
        rightsInvoices: false,
        rightsMarketplace: false,
        rightsStorage: false,

        PrivacyChangeEvery: [null, [Validators.required]],
      });
    }
    /* sipOuters = {
        option: [],
        selected: null,
        isOpen: false
    };

    ext_phone = {
        option: [{title: 'outer 1'}, {title: 'outer 2'}, {title: 'outer 3'}, {title: 'outer 4'}],
        selected: null,
        isOpen: false
    };


    // @ViewChildren('label') labelFields;

    constructor(
        private formBuilder: FormBuilder,
        private _extensions: ExtensionsServices,
        private _numbers: PhoneNumbersServices,
        private router: Router
    ) {
        this.formGeneral = this.formBuilder.group({
            outer: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required]],
            default: false,
            encryption: false,
            user: this.formBuilder.group({
                firstname: ['', []],
                lastname: ['', []],
                email: ['', [Validators.pattern(emailRegExp)]]
            }),
            mobileApp: [''],
            external: [''],
            toAdmin: false,
            toUser: false
        });
        // console.log(this.formGeneral);
    }

    toggleHighlightLabel(event): void {
        event.target.labels[0].classList.toggle('active');
    } */

    selectTab(text: string): void {
        this.tab.select = text;
    }

    /* changeCheckbox(text: string): void {
        this.formGeneral.get(text).setValue(!this.formGeneral.get(text).value);
    }

    selectPhone(phone): void {
        this.sipOuters.selected = phone;
        this.formGeneral.get('outer').setValue(phone.id);
    }

    selectExternal(phone): void {
        this.ext_phone.selected = phone;
        this.formGeneral.get('external').setValue(phone.title);
    }

    sendPassword(): void {
        // etc.
    }

    getExtension() {

    }

    getSipOuters() {
        this.loading += 1;
        this._numbers.getSipOuters().then(res => {
            res['items'].map(number => {
                this.sipOuters.option.push({id: number.id, title: number.phoneNumber});
            });
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
    }*/

    doSave() {
      /*
        this.formGeneral.markAsTouched();
        this.validate(this.formGeneral);
        // console.log(this.formGeneral.valid);
        if (this.formGeneral.valid) {
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
                    }
                );
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
        */
    }

    ngOnInit(): void {
        this.loading = 0;
        // this.getExtension();
        // this.getSipOuters();
    }
}
