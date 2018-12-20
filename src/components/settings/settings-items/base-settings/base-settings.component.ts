import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators, AbstractControl} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/Observable';

import {SettingsService} from '@services/settings.service';
import {MessageServices} from '@services/message.services';
import {FadeAnimation} from '@shared/fade-animation';
import {SettingsModel, SettingsOptionItem, SettingsBaseItem, SettingsItem, SettingsGroupItem} from '@models/settings.models';
import {FormBaseComponent} from '@elements/pbx-form-base-component/pbx-form-base-component.component';
import {ModalEx} from '@elements/pbx-modal/pbx-modal.component';
import {numberRegExp, simpleNameRegExp} from '@shared/vars';
import {walletAddressValidator} from '@shared/encry-form-validators';


@Component({
    selector: 'base-settings-component',
    templateUrl: './template.html',
    styleUrls: ['../../local.sass'],
    providers: [SettingsService],
    animations: [FadeAnimation('300ms')]
})
export class BaseSettingsComponent extends FormBaseComponent implements OnInit {

    model: SettingsModel = new SettingsModel();
    modelValues: SettingsOptionItem[] = [];
    changes: SettingsOptionItem[] = [];

    qrCode: string;

    saveButton: any = {buttonType: 'success', value: 'Save', inactive: false, loading: false};
    cancelButton: any = {buttonType: 'cancel', value: 'Cancel', inactive: false, loading: false};
    modalExit: ModalEx = new ModalEx('', 'cancelEdit');

    @Input() path: string;

    get modelEdit(): boolean {
        return true;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(
        protected router: Router,
        protected service: SettingsService,
        protected message: MessageServices,
        protected fb: FormBuilder,
        protected translate: TranslateService
    ) {
        super(fb, message, translate);
    }

    ngOnInit() {
        this.getInitialParams();
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        const dataChanged: boolean = this.changes.length !== 0;
        return super.canDeactivate(dataChanged);
    }

    createForm(items: SettingsBaseItem[]): FormGroup {
        const form = new FormGroup({});
        this.modelValues.forEach(value => {
            const item: SettingsItem = this.getItemById(value.id, items);
            if (item) {
                const validators = this.getItemValidators(item);
                try {
                    form.addControl(item.name, new FormControl(item.value, validators));
                }
                catch (error) {
                    console.error('Add form control error', error.message, item.name, validators);
                }
            }
        });
        return form;
    }

    initForm(): void {
        // console.log('form', this.form.value);
    }

    getItemById(id: number, items: SettingsBaseItem[]): SettingsItem {
        for (const item of items) {
            if (!item.isGroup) {
                const settingsItem = <SettingsItem>item;
                if (settingsItem && settingsItem.id === id) {
                    return settingsItem;
                }
            }
            else {
                const result = this.getItemById(id, (<SettingsGroupItem>item).children);
                if (result) return result;
            }
        }

        return null;
    }

    getItemValidators(item: SettingsItem): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        switch (item.type) {
            case 'int':
                this.validationHost.customMessages.push({
                    key: item.name,
                    error: 'pattern',
                    message: this.translate.instant('Value may contain numbers only')
                });
                validators.push(Validators.pattern(numberRegExp));
                break;
            case 'string':
                this.validationHost.customMessages.push({
                    key: item.name,
                    error: 'pattern',
                    message: this.translate.instant('Value may contain letters and numbers only')
                });
                validators.push(Validators.pattern(simpleNameRegExp));
                break;
        }

        if (item.name === 'BTC' || item.name === 'LTC' || item.name === 'ETH' || item.name === 'ETC') {
            this.validationHost.customMessages.push({
                key: item.name,
                error: 'walletAddress',
                message: this.translate.instant(`Please enter valid ${item.name} wallet address`)
            });
            validators.push(walletAddressValidator(item.name));
        }

        return validators;
    }

    // -- event handlers ------------------------------------------------------

    onValueChange(item: SettingsItem): void {
        const selectedKey: any = Object.keys(this.form.value).find(fv => fv === item.name);
        if (selectedKey) {
            item.value = this.form.value[selectedKey];
        }

        const original = this.modelValues.find(v => v.id === item.id);
        if (!original || original.value !== item.value) {
            const change = this.changes.find(c => c.id === item.id);
            if (change) {
                change.value = item.value;
            }
            else {
                this.changes.push(new SettingsOptionItem(item.id, item.value));
            }
        }
        else {
            this.changes = this.changes.filter(c => c.id !== item.id);
        }

        this.checkItemQRCode(item);
    }

    save(): void {
        if (this.validateForms()) {
            this.saveSettings();
        }
        else {
            this.scrollToFirstError();
        }
    }

    cancel(): void {
        this.router.navigateByUrl('/cabinet/settings');
    }

    // -- component methods ---------------------------------------------------

    findSettingById(id: number, items: SettingsBaseItem[]): SettingsItem {
        for (const item of items) {
            if ((<SettingsItem>item).id === id) return <SettingsItem>item;
            if (item.isGroup) {
                const child = this.findSettingById(id, (<SettingsGroupItem>item).children);
                if (child) return child;
            }
        }
        return null;
    }

    saveModelState(items: SettingsBaseItem[]): void {
        items.forEach(i => {
            if (!i.isGroup) {
                const settingsItem = <SettingsItem>i;
                this.modelValues.push(new SettingsOptionItem(settingsItem.id, settingsItem.value));
                this.checkItemQRCode(settingsItem);
            }
            else this.saveModelState((<SettingsGroupItem>i).children);
        });
    }

    setDefaultValue(item: SettingsItem): void {
        if (!item.value) {
            if (item.type === 'bool') item.value = false;
            else if (item.type === 'int') item.value = 0;
            else if (item.type === 'string') item.value = '';
            else if (item.type === 'list') {
                item.value = item.options[0].id;
            }
        }
    }

    checkItemQRCode(item: SettingsItem): void {
        if (item.key === 'two_factor_auth_type') {
            const selected = item.options.find(o => o.id === item.value);
            if (selected && selected.value === 'google') {
                this.getQR();
            }
            else {
                this.qrCode = null;
            }
        }
    }

    // -- data processing methods ---------------------------------------------

    getInitialParams(): void {
        this.locker.lock();

        this.service.getSettingsParams(this.path)
            .then(response => {
                const model = SettingsModel.create(response.settings);
                this.modelValues = [];
                this.saveModelState(model.items);

                this.form = this.createForm(model.items);
                this.model = model;
                super.ngOnInit();
            })
            .catch(() => {})
            .then(() => this.locker.unlock());
    }

    getQR(): void {
        this.service.getQRCode()
            .then(response => {
                this.qrCode = response.qrImage;
            })
            .catch(() => {});
    }

    saveSettings(): void {
        if (this.changes.length === 0) {
            this.message.writeSuccess(this.translate.instant('The data has been saved'));
            return;
        }

        this.saveButton.loading = true;

        this.service.saveSettings(this.changes, this.path, false)
            .then(response => {
                this.message.writeSuccess(this.translate.instant(response.message));
                this.changes = [];
                this.modelValues = [];
                this.saveModelState(this.model.items);
                this.saveFormState();
            })
            .catch(() => {})
            .then(() => this.saveButton.loading = false);
    }
}
