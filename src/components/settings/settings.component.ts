import {Component} from '@angular/core';
import {MainViewComponent} from '../main-view.component';
import {FadeAnimation} from '../../shared/fade-animation';
import {LocalStorageServices} from '@services/local-storage.services';


@Component({
    selector: 'pbx-settings',
    templateUrl: './template.html',
    animations: [FadeAnimation('300ms')],
    styleUrls: ['./local.sass']
})

export class SettingsComponent {
    currentTheme: string;
    showSystemSettings: boolean = true;

    constructor(private _main: MainViewComponent, private storage: LocalStorageServices) {
        this.currentTheme = this._main.userTheme;
        let user: any;
        user = this.storage.readItem('pbx_user');
        if (!user.profile.tariffPlan) {
            this.showSystemSettings = false;
        }
    }

    settings = {
        profile: [
            {
                id: 1,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/profile_48px.svg',
                title: 'Profile',
                routerLink: 'profile'
            },
            {
                id: 2,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/notification_48px.svg',
                title: 'Notifications',
                routerLink: 'user-notifications'
            }
        ],
        theme: [
            {
                id: 1,
                value: 'light_theme',
                available: true,
                src: '../../assets/icons/_middle/crm_ok.svg',
                text: 'white'
            },
            {
                id: 2,
                value: 'dark_theme',
                available: true,
                src: '../../assets/icons/_middle/crm_ok.svg',
                text: 'black'
            }
        ],
        system: [
            {
                id: 1,
                available: true,
                icon: false,
                src: '',
                title: 'Active Sessions',
                routerLink: 'sessions'
            },
            {
                id: 2,
                available: true,
                icon: false,
                src: '',
                title: 'Two-Factor Authentication',
                routerLink: 'authentication'
            },
            {
                id: 3,
                available: false,
                icon: false,
                src: '',
                title: 'Allowed country codes',
                routerLink: ''
            },
            {
                id: 4,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/billing_48px.svg',
                title: 'Billing',
                routerLink: 'billing'
            },
            {
                id: 5,
                available: false,
                icon: true,
                src: '../../assets/icons/_settings/backup_48px.svg',
                title: 'Backup',
                routerLink: ''
            },
            {
                id: 6,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/notification_48px.svg',
                title: 'Notifications',
                routerLink: 'account-notifications'
            },
            {
                id: 7,
                available: false,
                icon: false,
                src: '',
                title: 'CRM integration',
                routerLink: 'crm-integration'
            },
            {
                id: 8,
                available: false,
                icon: false,
                src: '',
                title: 'API integration',
                routerLink: ''
            }
        ],
        mobile: [
            {
                id: 1,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/profile_48px.svg',
                title: 'Profile',
                routerLink: 'profile'
            },
            {
                id: 2,
                available: true,
                icon: true,
                src: '../../assets/icons/_menu/settings.svg',
                title: 'Security',
                routerLink: ''
            },
            {
                id: 3,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/billing_48px.svg',
                title: 'Billing',
                routerLink: 'billing'
            },
            {
                id: 4,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/backup_48px.svg',
                title: 'Backup',
                routerLink: ''
            },
            {
                id: 5,
                available: true,
                icon: true,
                src: '../../assets/icons/_settings/notification_48px.svg',
                title: 'Notifications',
                routerLink: 'user-notifications'
            },
            {
                id: 6,
                available: true,
                icon: false,
                src: '',
                title: 'CRM integration',
                routerLink: ''
            }
        ]
    };

    changeTheme(theme: string): void {
        if (this.currentTheme !== theme) {
            this._main.setUserTheme(theme);
            this.currentTheme = this._main.userTheme;
        }
    }
}
