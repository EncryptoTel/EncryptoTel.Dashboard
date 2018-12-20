import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuardServices} from '@services/auth-guard.services';
import {CanDeactivateFormGuard} from '@services/can-deactivate-form-guard.service';

import {PageNotFoundComponent} from '@components/errors/page-not-found/page-not-found.component';

import {BlankComponent} from '@components/blank/blank.component';

import {IndexComponent} from '@components/index/index.component';

import {SignInComponent} from '@components/sign-in/sign-in.component';

import {SignUpComponent} from '@components/sign-up/sign-up.component';
import {SignUpTariffPlansComponent} from '@components/sign-up/tariff-plans/sign-up-tariff-plans.component';
import {SignUpFormComponent} from '@components/sign-up/sign-up-form/sign-up-form.component';

import {TemporaryCodeComponent} from '@components/temporary-code/temporary-code.component';

import {EmailConfirmComponent} from '@components/confirmation/email-confirm.component';
import {CodeConfirmComponent} from '@components/confirmation/code-confirm.component';
import {PasswordResetComponent} from '@components/confirmation/password-reset.component';

import {PasswordRecoveryComponent} from '@components/password-recovery/password-recovery.component';

import {DashboardComponent} from '@components/dashboard/dashboard.component';

import {RefillBalanceComponent} from '@components/refill-balance/refill-balance.component';

import {TariffPlansComponent} from '@components/tariff-plans/tariff-plans.component';

import {PhoneNumbersComponent} from '@components/phone-numbers/phone-numbers.component';
import {BuyPhoneNumbersComponent} from '@components/phone-numbers/buy/buy.phone-numbers.component';

import {AddressBookComponent} from '@components/address-book/address-book.component';

import {CallRulesComponent} from '@components/call-rules/call-rules.component';
import {CallRulesCreateComponent} from '@components/call-rules/call-rules-create/call-rules-create.component';

import {CallQueuesComponent} from '@components/call-queues/call-queues.component';
import {CallQueuesCreateComponent} from '@components/call-queues/call-queues-create/call-queues-create.component';

import {RingGroupsComponent} from '@components/ring-groups/ring-groups.component';
import {RingGroupsCreateComponent} from '@components/ring-groups/ring-groups-create/ring-groups-create.component';

import {ExtensionsComponent} from '@components/extensions/extensions.component';
import {AddExtensionsComponent} from '@components/extensions/add/add.extension.component';

import {CompanyComponent} from '@components/company/company.component';

import {DepartmentsComponent} from '@components/departments/department.component';
import {DepartmentCreateComponent} from '@components/departments/department-create/department-create.component';

import {DetailsAndRecordsComponent} from '@components/details-and-records/details-and-records.component';

import {InvoicesComponent} from '@components/invoices/invoices.component';

import {MarketplaceComponent} from '@components/marketplace/marketplace.component';

import {StorageComponent} from '@components/storage/storage.component';

import {PartnerProgramComponent} from '@components/partner-program/partner-program.component';
import {KnowledgeBaseComponent} from '@components/knowledge-base/knowledge-base.component';

import {SettingsComponent} from '@components/settings/settings.component';
import {ProfileComponent} from '@components/settings/settings-items/profile/profile.component';
import {AuthenticationComponent} from '@components/settings/settings-items/authentication/authentication.component';
import {BillingComponent} from '@components/settings/settings-items/billing/billing.component';
import {AccountNotificationsComponent} from '@components/settings/settings-items/account-notifications/account-notifications.component';
import {UserNotificationsComponent} from '@components/settings/settings-items/user-notifications/user-notifications.component';
import {RefComponent} from '@components/confirmation/ref.component';
import {SessionsComponent} from '@components/settings/settings-items/sessions/sessions.component';
import {AudioConferenceComponent} from '@components/audio-conference/audio-conference.component';
import {AudioConferenceCreateComponent} from '@components/audio-conference/audio-conference-create/audio-conference-create.component';
import {CRMIntegrationComponent} from '@components/settings/settings-items/crm-integration/crm-integration.component';
import {AmoCrmIntegrationComponent} from '@components/settings/settings-items/crm-integration/amo-crm-integration/amo-crm-integration.component';
import {LogoutComponent} from '@components/logout/logout.component';

const Routes: Routes = [
    {path: '', redirectTo: 'cabinet', pathMatch: 'full'},
    {
        path: 'sign-in', component: SignInComponent, data: { title: 'Authorization', indexed: true }
    },
    {
        path: 'logout', component: LogoutComponent, data: { indexed: false }
    },
    {
        path: 'sign-up', component: SignUpComponent, children: [
            {path: '', component: SignUpFormComponent, data: {title: 'Registration', indexed: true}},
            {
                path: 'tariff_plans',
                component: SignUpTariffPlansComponent,
                data: {title: 'Select Tariff Plans', indexed: false}
            }
        ]
    },
    {
        path: 'password-recovery',
        component: PasswordRecoveryComponent,
        data: {title: 'Password Recovery', indexed: true}
    },
    {
        path: 'temporary-code',
        component: TemporaryCodeComponent,
        data: {title: 'Temporary Code Authentication', indexed: true}
    },
    {
        path: 'email-confirmation/:hash',
        component: EmailConfirmComponent,
        data: {title: 'Email Confirmation', indexed: false}
    },
    {
        path: 'code-confirmation/:hash',
        component: CodeConfirmComponent,
        data: {title: 'Code Confirmation', indexed: false}
    },
    {
        path: 'ref/:hash',
        component: RefComponent,
        data: {title: 'Ref link', indexed: false}
    },
    {path: 'password-reset/:hash', component: PasswordResetComponent, data: {title: 'Password Reset', indexed: false}},
    {
        path: 'cabinet', canActivate: [AuthGuardServices], component: IndexComponent, children: [
            {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
            {path: 'dashboard', component: DashboardComponent, data: {title: 'Dashboard', indexed: true}},
            {
                path: 'phone-numbers', children: [
                    {path: '', component: PhoneNumbersComponent, data: {title: 'Phone Numbers', indexed: true}},
                    {
                        path: 'buy',
                        component: BuyPhoneNumbersComponent,
                        data: {title: 'Buy External Phone Numbers', indexed: true}
                    },
                    {
                        path: 'internal',
                        component: BlankComponent,
                        data: {title: 'Buy Internal Phone Numbers', indexed: true}
                    },
                    {
                        path: 'external',
                        component: BlankComponent,
                        data: {title: 'Add External Phone Number', indexed: true}
                    }
                ]
            },
            {
                path: 'address-book',
                component: AddressBookComponent,
                data: { title: 'Address Book', indexed: true },
                canDeactivate: [ CanDeactivateFormGuard ],
                children: [
                    {
                        path: ':id',
                        component: AddressBookComponent,
                        data: { title: 'Address Book', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    }
                ]
            },
            {
                path: 'call-rules', data: {title: 'Call Rules', indexed: true}, children: [
                    {
                        path: '',
                        component: CallRulesComponent,
                        data: { title: 'Call Rules', indexed: true }
                    },
                    {
                        path: 'create',
                        component: CallRulesCreateComponent,
                        data: { title: 'Create Call Rule', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: ':id',
                        component: CallRulesCreateComponent,
                        data: { title: 'Edit Call Rule', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    }
                ]
            },
            {
                path: 'call-queues', children: [
                    {path: '', component: CallQueuesComponent, data: {title: 'Call Queues', indexed: true}},
                    {
                        path: 'create',
                        component: CallQueuesCreateComponent,
                        data: { title: 'Create Call Queue', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: ':id',
                        component: CallQueuesCreateComponent,
                        data: { title: 'Edit Call Queue', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    }
                ]
            },
            {
                path: 'ring-groups', children: [
                    {path: '', component: RingGroupsComponent, data: {title: 'Ring Groups', indexed: true}},
                    {
                        path: 'create',
                        component: RingGroupsCreateComponent,
                        data: { title: 'Create Ring Group', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: ':id',
                        component: RingGroupsCreateComponent,
                        data: { title: 'Edit Ring Group', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    }
                ]
            },
            {
                path: 'ivr',
                loadChildren: '@components/ivr/ivr.module#IvrModule'
            },
            {
                path: 'audio-conference', children: [
                    {path: '', component: AudioConferenceComponent, data: {title: 'Audio Conference', indexed: true}},
                    {
                        path: 'create',
                        component: AudioConferenceCreateComponent,
                        data: {title: 'Audio Conference', indexed: true},
                    },
                    {
                        path: ':id',
                        component: AudioConferenceCreateComponent,
                        data: {title: 'Audio Conference Create', indexed: true},
                    }
                ]
            },
            {
                path: 'company',
                component: CompanyComponent,
                data: { title: 'Company', indexed: true},
                canDeactivate: [ CanDeactivateFormGuard ]
            },
            {
                path: 'departments', children: [
                    {
                        path: '',
                        component: DepartmentsComponent,
                        data: { title: 'Departments', indexed: true} },
                    {
                        path: 'create',
                        component: DepartmentCreateComponent,
                        data: { title: 'Create Department', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: ':id',
                        component: DepartmentCreateComponent,
                        data: { title: 'Edit Departments', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    }
                ]
            },
            {
                path: 'extensions', children: [
                    {
                        path: '', 
                        component: ExtensionsComponent, 
                        data: { title: 'Extensions', indexed: true }
                    },
                    {
                        path: 'create',
                        component: AddExtensionsComponent,
                        data: { title: 'Create Extension', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: ':id', 
                        component: AddExtensionsComponent, 
                        data: { title: 'Edit Extension', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    }
                ]
            },
            {
                path: 'details-and-records',
                component: DetailsAndRecordsComponent,
                data: {title: 'Details and Records', indexed: true}
            },
            {path: 'invoices', component: InvoicesComponent, data: {title: 'Invoices', indexed: true}},
            {path: 'storage', component: StorageComponent, data: {title: 'Storage', indexed: true}},
            {path: 'marketplace', component: MarketplaceComponent, data: {title: 'Marketplace', indexed: true}},
            {
                path: 'settings', children: [
                    {path: '', component: SettingsComponent, data: {title: 'Settings', indexed: true}},
                    {
                        path: 'profile',
                        component: ProfileComponent,
                        data: { title: 'Profile Settings', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: 'authentication',
                        component: AuthenticationComponent,
                        data: { title: 'Two-Factor Authentication', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: 'billing',
                        component: BillingComponent,
                        data: { title: 'Billing Settings', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: 'account-notifications',
                        component: AccountNotificationsComponent,
                        data: { title: 'Account Notification Settings', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: 'user-notifications',
                        component: UserNotificationsComponent,
                        data: { title: 'User Notification Settings', indexed: true },
                        canDeactivate: [ CanDeactivateFormGuard ]
                    },
                    {
                        path: 'sessions',
                        component: SessionsComponent,
                        data: {title: 'Active Sessions', indexed: true}
                    },
                    {
                        path: 'crm-integration', children: [
                            {
                                path: '',
                                component: CRMIntegrationComponent,
                                data: {title: 'CRM Integration', indexed: true}
                            },
                            {
                                path: 'amo-crm-integration',
                                component: AmoCrmIntegrationComponent,
                                data: {title: 'AMO CRM Integration', indexed: true}
                            }
                        ]
                    }
                ]
            },
            {
                path: 'refill',
                component: RefillBalanceComponent,
                data: { title: 'Refill Balance', indexed: true },
                runGuardsAndResolvers: 'always',
                canDeactivate: [ CanDeactivateFormGuard ]
            },
            {path: 'tariff', component: TariffPlansComponent, data: {title: 'Tariff Plan', indexed: true}},
            {
                path: 'partner-program',
                component: PartnerProgramComponent,
                data: { title: 'Partner Program', indexed: true },
                canDeactivate: [ CanDeactivateFormGuard ]
            },
            {
                path: 'knowledge-base',
                component: KnowledgeBaseComponent,
                data: {title: 'Knowledge Base', indexed: true}
            },
            {path: 'blank', component: BlankComponent, data: {title: 'Blank Component', indexed: true}},
        ]
    },
    {path: '**', component: PageNotFoundComponent, data: {title: 'Page not Found', indexed: false}}
];

@NgModule({
    imports: [
        RouterModule.forRoot(Routes, {onSameUrlNavigation: 'reload'})
    ],
    exports: [
        RouterModule
    ],
    providers: [
        AuthGuardServices,
        CanDeactivateFormGuard
    ]
})
export class MainRouterModule {
}
