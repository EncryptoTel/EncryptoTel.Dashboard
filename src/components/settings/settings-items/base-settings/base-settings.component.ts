import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {SettingsService} from '../../../../services/settings.service';
import {FadeAnimation} from '../../../../shared/fade-animation';
import {MessageServices} from '../../../../services/message.services';
import {FormBaseComponent} from '../../../../elements/pbx-form-base-component/pbx-form-base-component.component';
import {FormBuilder} from '@angular/forms';
import {SettingsModel, SettingsOptionItem, SettingsBaseItem} from '../../../../models/settings.models';


@Component({
    selector: 'base-settings-component',
    templateUrl: './template.html',
    styleUrls: ['../../local.sass'],
    providers: [SettingsService],
    animations: [FadeAnimation('300ms')]
})
export class BaseSettingsComponent extends FormBaseComponent implements OnInit {
    
    settings: any;
    model: SettingsModel;

    selectedItems: any = {};

    qrCode: string;

    options = [];
    inputOptions = [];

    inputOptionsEx: SettingsOptionItem[] = [];

    saveButton = {buttonType: 'success', value: 'Save', inactive: false, loading: false};

    modelTemplate: boolean = false;

    @Input() path: string;

    // -- component lifecycle methods -----------------------------------------

    constructor(
        protected router: Router,
        protected service: SettingsService,
        protected message: MessageServices,
        protected fb: FormBuilder
    ) {
        super(fb, message);
    }

    ngOnInit() {
        this.getInitialParams();
    }

    // -- form setup and helpers methods --------------------------------------
    // -- event handlers ------------------------------------------------------

    goBack(): void {
        this.router.navigateByUrl('/cabinet/settings');
    }

    // -- component methods ---------------------------------------------------

    normalizeTitle(text: string): string {
        text = text.replace(/\r?\n/g, '');
        text = text.replace(new RegExp('_', 'g'), ' ');
        text = text.charAt(0).toUpperCase() + text.substr(1);
        return text.trim();
    }

    getKeys(obj: any): string[] {
        return obj && Object.keys(obj);
    }

    generateOptions(obj: any): any[] {
        if (obj.type !== 'list') {
            return null;
        }
        const tmp = [];
        Object.keys(obj.list_value).forEach(key => {
            tmp.push({id: key, title: obj.list_value[key]});
        });
        // console.log(tmp);
        return tmp;
    }

    getEventValue(event: any): any {
        if (typeof event === 'boolean' || typeof event === 'string') {
            return event;
        } 
        else {
            return event.id;
        }
    }

	// -- data processing methods ---------------------------------------------

    getInitialParams(): void {
        this.locker.lock();
        
        this.inputOptions = [];
        this.service.getSettingsParams(this.path).then(response => {
            Object.keys(response.settings).forEach(key => {
                Object.keys(response.settings[key].children).map(inputKey => {
                    if (response.settings[key].children[inputKey].type === 'list') {

                        this.inputOptions[`${key}_${inputKey}`] = this.generateOptions(response.settings[key].children[inputKey]);

                        const selectedId = response.settings[key].children[inputKey].value;
                        this.selectedItems[inputKey] = {
                            id: selectedId,
                            title: response.settings[key].children[inputKey].list_value[selectedId]
                        };
                        if (response.settings[key].children[inputKey].list_value[selectedId] === 'google') {
                            this.getQR();
                        }
                    }
                    else if (response.settings[key].children[inputKey].type === 'group_field') {
                        Object.keys(response.settings[key].children[inputKey].children).forEach(childrenKey => {
                            if (response.settings[key].children[inputKey].children[childrenKey].type === 'list') {

                                this.inputOptions[`${key}_${inputKey}_${childrenKey}`] = this.generateOptions(response.settings[key].children[inputKey].children[childrenKey]);

                                const selectedId = response.settings[key].children[inputKey].children[childrenKey].value;
                                this.selectedItems[childrenKey] = {
                                    id: selectedId,
                                    title: response.settings[key].children[inputKey].children[childrenKey].list_value[selectedId]
                                };
                            }
                        });
                    }
                });
            });
            
            this.settings = response.settings;
            // console.log('settings', response.settings);
            // console.log('input-options', this.inputOptions);
            // console.log('selected-items', this.selectedItems);
            
            this.model = SettingsModel.create(response.settings);
            // console.log('model', this.model);
            // console.log('input-options-ex', this.inputOptionsEx);

        }).catch(() => {})
          .then(() => this.locker.unlock());
    }

    getQR(): void {
        this.service.getQRCode().then(response => {
            this.qrCode = response.qrImage;
        }).catch(() => {});
    }

    saveOption(ev: any, key: string, inputKey: string, childrenKey?: string): void {
        let childItem = this.settings[key].children[inputKey];

        if (childItem.type === 'list') {
            childrenKey ? this.selectedItems[childrenKey] = ev : this.selectedItems[inputKey] = ev;
        } else if (childItem.type === 'group_field') {
            this.selectedItems[childrenKey] = ev;
        }

        let id = !childrenKey ? childItem.id : childItem.children[childrenKey].id;
        let settingsItem = this.options.find(item => item.id === id);

        if (!settingsItem) {
            settingsItem = {id: id, value: null};
            this.options.push(settingsItem);
        }
        settingsItem.value = this.getEventValue(ev);

        // this.saveButton.inactive = this.options.length === 0;

        if (inputKey === 'two_factor_auth_type') {
            if (ev.title === 'google') {
                this.getQR();
            } else {
                this.qrCode = null;
            }
        }

        // this.service.saveSetting(id, this.getEventValue(ev), this.path).then(() => {
        //     if (ev.title === 'google') {
        //         this.getQR();
        //     } else { this.qrCode = null; }}).catch();
    }

    saveSettings() {
        if (this.options.length === 0) {
            this.message.writeSuccess('The data have been saved');
            return;
        }

        this.saveButton.loading = true;
        
        this.service.saveSettings(this.options, this.path, false).then(response => {
            this.message.writeSuccess(response.message);
            this.options = [];
            // this.saveButton.inactive = true;
            //this.goBack();
        }).catch(() => {})
          .then(() => this.saveButton.loading = false);
    }
}
