import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FormsModule} from '@angular/forms';

import {ElementsModule} from './elements.module';
import {MainRouterModule} from './router.module';

import {PageNotFoundComponent} from '../components/errors/page-not-found/page-not-found.component';

import {IndexComponent} from '../components/index/index.component';
import {SignInComponent} from '../components/sign-in/sign-in.component';
import {SignUpComponent} from '../components/sign-up/sign-up.component';
import {EmailConfirmComponent} from '../components/confirmation/email-confirm.component';
import {CodeConfirmComponent} from '../components/confirmation/code-confirm.component';
import {PasswordRecoveryComponent} from '../components/password-recovery/password-recovery.component';
import {PasswordResetComponent} from '../components/confirmation/password-reset.component';
import {DashboardComponent} from '../components/dashboard/dashboard.component';
import {TariffPlansComponent} from '../components/tariff-plans/tariff-plans.component';
import {SignUpTariffPlansComponent} from '../components/sign-up/tariff-plans/sign-up-tariff-plans.component';
import {SignUpFormComponent} from '../components/sign-up/sign-up-form/sign-up-form.component';
import {BlankComponent} from '../components/blank/blank.component';
import {SettingsComponent} from '../components/settings/settings.component';
import {TemporaryCodeComponent} from '../components/temporary-code/temporary-code.component';
import {CompanyComponent} from '../components/company/company.component';
import {MarketplaceComponent} from '../components/marketplace/marketplace.component';
import {StorageComponent} from '../components/storage/storage.component';
import {DetailsAndRecordsComponent, TimePipe} from '../components/details-and-records/details-and-records.component';
import {InvoicesComponent} from '../components/invoices/invoices.component';
import {CallQueuesComponent} from '../components/call-queues/call-queues.component';
import {CallQueuesCreateComponent} from '../components/call-queues/call-queues-create/call-queues-create.component';
import {ProfileComponent} from '../components/settings/settings-items/profile/profile.component';
import {AuthenticationComponent} from '../components/settings/settings-items/authentication/authentication.component';
import {BillingComponent} from '../components/settings/settings-items/billing/billing.component';
import {AccountNotificationsComponent} from '../components/settings/settings-items/account-notifications/account-notifications.component';
import {UserNotificationsComponent} from '../components/settings/settings-items/user-notifications/user-notifications.component';
import {DepartmentsComponent} from '../components/departments/department.component';
import {PhoneNumbersComponent} from '../components/phone-numbers/phone-numbers.component';
import {CallRulesComponent} from '../components/call-rules/call-rules.component';
import {CallRulesCreateComponent} from '../components/call-rules/call-rules-create/call-rules-create.component';
import {AddressBookComponent} from '../components/address-book/address-book.component';
import {BuyPhoneNumbersComponent} from '../components/phone-numbers/buy/buy.phone-numbers.component';
import {ExtensionsComponent} from '../components/extensions/extensions.component';
import {RefillBalanceComponent} from '../components/refill-balance/refill-balance.component';
import {AddExtensionsComponent} from '../components/extensions/add/add.extension.component';
import {GeneralAddExtensionComponent} from '../components/extensions/add/general/general.add.extension.component';
import {OptionsAddExtensionComponent} from '../components/extensions/add/options/options.add.extension.component';
import {CallRulesTimeoutComponent} from '../components/call-rules/call-rules-create/timeout/call-rules-timeout.component';
import {CallRulesTimeRulesComponent} from '../components/call-rules/call-rules-create/time-rules/call-rules-time-rules.component';
import {RightsAddExtensionComponent} from '../components/extensions/add/rights/rights.add.extension.component';
import {RingGroupsComponent} from '../components/ring-groups/ring-groups.component';
import {RingGroupsCreateComponent} from '../components/ring-groups/ring-groups-create/ring-groups-create.component';
import {ChatComponent} from '../components/chat/chat.component';
import {PartnerProgramComponent} from '../components/partner-program/partner-program.component';
import {KnowledgeBaseComponent} from '../components/knowledge-base/knowledge-base.component';
import {OverviewPartnerProgramComponent} from '../components/partner-program/overview/overview.partner-program.component';
import {LinksPartnerProgramComponent} from '../components/partner-program/links/links.partner-program.component';
import {ReportsPartnerProgramComponent} from '../components/partner-program/reports/reports.partner-program.component';
import {TermsPartnerProgramComponent} from '../components/partner-program/terms/terms.partner-program.component';
import {IvrComponent} from '../components/ivr/ivr.component';
import {IvrCreateComponent} from "../components/ivr/ivr-create/ivr-create.component";
import {BaseSettingsComponent} from "../components/settings/settings-items/base-settings/base-settings.component";
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import {VgStreamingModule} from 'videogular2/streaming';
import {RefComponent} from "../components/confirmation/ref.component";
import {BaseComponent} from "../elements/pbx-component/pbx-component.component";

/*
  Components declarations and exports
 */

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AngularSvgIconModule,
        ElementsModule,
        MainRouterModule,
        FormsModule,
    	VgCoreModule,
    	VgControlsModule,
    	VgOverlayPlayModule,
    	VgBufferingModule,
    	VgStreamingModule
    ],
    declarations: [
        BaseComponent,
        PageNotFoundComponent,
        IndexComponent,
        SignInComponent,
        SignUpComponent,
        EmailConfirmComponent,
        CodeConfirmComponent,
        TemporaryCodeComponent,
        PasswordRecoveryComponent,
        PasswordResetComponent,
        DashboardComponent,
        TariffPlansComponent,
        SignUpTariffPlansComponent,
        SignUpFormComponent,
        DashboardComponent,
        BlankComponent,
        SettingsComponent,
        CompanyComponent,
        MarketplaceComponent,
        StorageComponent,
        DetailsAndRecordsComponent,
        InvoicesComponent,
        CallQueuesComponent,
        CallQueuesCreateComponent,
        ProfileComponent,
        AuthenticationComponent,
        BillingComponent,
        AccountNotificationsComponent,
        UserNotificationsComponent,
        PhoneNumbersComponent,
        AddressBookComponent,
        DepartmentsComponent,
        CallRulesComponent,
        CallRulesCreateComponent,
        PhoneNumbersComponent,
        BuyPhoneNumbersComponent,
        ExtensionsComponent,
        RefillBalanceComponent,
        AddExtensionsComponent,
        GeneralAddExtensionComponent,
        CallRulesTimeoutComponent,
        CallRulesTimeRulesComponent,
        GeneralAddExtensionComponent,
        OptionsAddExtensionComponent,
        RightsAddExtensionComponent,
        RingGroupsComponent,
        RingGroupsCreateComponent,
        ChatComponent,
        PartnerProgramComponent,
        OverviewPartnerProgramComponent,
        LinksPartnerProgramComponent,
        ReportsPartnerProgramComponent,
        TermsPartnerProgramComponent,
        KnowledgeBaseComponent,
        TimePipe,
        IvrComponent,
        IvrCreateComponent,
        BaseSettingsComponent,
        RefComponent
    ],
    exports: [
        BaseComponent,
        ElementsModule,
        PageNotFoundComponent,
        IndexComponent,
        SignInComponent,
        SignUpComponent,
        EmailConfirmComponent,
        CodeConfirmComponent,
        TemporaryCodeComponent,
        PasswordRecoveryComponent,
        PasswordResetComponent,
        DashboardComponent,
        BlankComponent,
        CompanyComponent,
        MarketplaceComponent,
        StorageComponent,
        CallQueuesComponent,
        CallQueuesCreateComponent,
        ProfileComponent,
        AuthenticationComponent,
        BillingComponent,
        AccountNotificationsComponent,
        UserNotificationsComponent,
        PhoneNumbersComponent,
        DepartmentsComponent,
        CallRulesComponent,
        CallRulesCreateComponent,
        AddressBookComponent,
        DepartmentsComponent,
        BuyPhoneNumbersComponent,
        ExtensionsComponent,
        RefillBalanceComponent,
        AddExtensionsComponent,
        GeneralAddExtensionComponent,
        RightsAddExtensionComponent,
        RingGroupsComponent,
        RingGroupsCreateComponent,
        PartnerProgramComponent,
        OverviewPartnerProgramComponent,
        LinksPartnerProgramComponent,
        ReportsPartnerProgramComponent,
        TermsPartnerProgramComponent,
        IvrComponent,
        IvrCreateComponent,
        BaseSettingsComponent,
        RefComponent
    ]
})
export class ComponentsModule {

}
