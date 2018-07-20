import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SettingsService} from '../../../../services/settings.service';
import {FadeAnimation} from '../../../../shared/fade-animation';

@Component({
    selector: 'base-settings-component',
    templateUrl: './template.html',
    styleUrls: ['../../local.sass'],
    providers: [SettingsService],
    animations: [FadeAnimation('300ms')]
})

export class BaseSettingsComponent implements OnInit {

    @Input() path: string;

    loading = {
        body: false
    };

    settings: any;

    selectedItems: any = {};

    qrCode: string;

    options = [];

    saveButton = {buttonType: 'success', value: 'Save', inactive: true, loading: false};

    constructor(private router: Router,
                private service: SettingsService) {

    }

    NormalizeTitle(text: string) {
        text = text.replace(/\r?\n/g, '');
        text = text.replace(new RegExp('_', 'g'), ' ');
        text = text.charAt(0).toUpperCase() + text.substr(1);
        return text.trim();
    }

    goBack(): void {
        this.router.navigateByUrl('/cabinet/settings');
    }

    getKeys = (obj: any): string[] => {
        return obj && Object.keys(obj);
    }
    generateOptions = (obj: any): any[] => {
        const tmp = [];
        Object.keys(obj).forEach(key => {
            tmp.push({id: key, title: obj[key]});
        });
        return tmp;
    }
    getEventValue = (ev: any): any => {
        if (typeof ev === 'boolean') {
            return ev;
        } else if (typeof ev === 'string') {
            return ev;
        } else {
            return ev.id;
        }
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

        this.saveButton.inactive = this.options.length === 0;

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
        this.saveButton.loading = true;
        this.service.saveSettings(this.options, this.path).then(res => {
            this.options = [];
            this.saveButton.inactive = true;
            this.saveButton.loading = false;
        }).catch(() => {
            this.saveButton.loading = false;
        });
    }

    getInitialParams(): void {
        this.loading.body = true;
        this.service.getSettingsParams(this.path)
            .then(res => {
                Object.keys(res.settings).forEach(key => {
                    Object.keys(res.settings[key].children).map(inputKey => {
                        if (res.settings[key].children[inputKey].type === 'list') {
                            const selectedId = res.settings[key].children[inputKey].value;
                            this.selectedItems[inputKey] = {
                                id: selectedId,
                                title: res.settings[key].children[inputKey].list_value[selectedId]
                            };
                            if (res.settings[key].children[inputKey].list_value[selectedId] === 'google') {
                                this.getQR();
                            }
                        } else if (res.settings[key].children[inputKey].type === 'group_field') {
                            Object.keys(res.settings[key].children[inputKey].children).forEach(childrenKey => {
                                if (res.settings[key].children[inputKey].children[childrenKey].type === 'list') {
                                    const selectedId = res.settings[key].children[inputKey].children[childrenKey].value;
                                    this.selectedItems[childrenKey] = {
                                        id: selectedId,
                                        title: res.settings[key].children[inputKey].children[childrenKey].list_value[selectedId]
                                    };
                                }
                            });
                        }
                    });
                });
                this.settings = res.settings;
                this.loading.body = false;
            }).catch(() => this.loading.body = false);
    }

    getQR(): void {
        this.service.getQRCode().then(res => {
            this.qrCode = res.qrImage;
            console.log(this.qrCode);
        }).catch();
    }

    ngOnInit() {
        this.getInitialParams();
    }
}
