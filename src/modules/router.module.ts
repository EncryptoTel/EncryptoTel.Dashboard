import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuardServices} from '../services/auth-guard.services';

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

const Routes: Routes = [
  {path: '', redirectTo: 'cabinet', pathMatch: 'full'},
  {path: 'sign-in', component: SignInComponent, data: {title: 'Authorization', indexed: true}},
  {path: 'sign-up', component: SignUpComponent, children: [
      {path: '', component: SignUpFormComponent, data: {title: 'Registration', indexed: true}},
      {path: 'tariff_plans', component: SignUpTariffPlansComponent, data: {title: 'Select tariff plans', indexed: false}}
      ]},
  {path: 'password-recovery', component: PasswordRecoveryComponent, data: {title: 'Password recovery', indexed: true}},
  {path: 'temporary-code', component: TemporaryCodeComponent, data: {title: 'Temporary code authorization', indexed: true}},
  {path: 'email-confirmation/:hash', component: EmailConfirmComponent, data: {title: 'Email confirmation', indexed: false}},
  {path: 'code-confirmation/:hash', component: CodeConfirmComponent, data: {title: 'Code confirmation', indexed: false}},
  {path: 'password-reset/:hash', component: PasswordResetComponent, data: {title: 'Password reset', indexed: false}},
  {path: 'cabinet', canActivate: [AuthGuardServices], component: IndexComponent, children: [
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent, data: {title: 'Dashboard', indexed: true}},
    {path: 'phone-numbers', component: BlankComponent, data: {title: 'Phone numbers', indexed: true}},
    {path: 'address-book', component: BlankComponent, data: {title: 'Address book', indexed: true}},
    {path: 'call-rules', component: BlankComponent, data: {title: 'Call rules', indexed: true}},
    {path: 'call-queues', component: BlankComponent, data: {title: 'Call queues', indexed: true}},
    {path: 'ring-groups', component: BlankComponent, data: {title: 'Ring groups', indexed: true}},
    {path: 'ivr', component: BlankComponent, data: {title: 'IVR', indexed: true}},
    {path: 'company', component: CompanyComponent, data: {title: 'Company', indexed: true}},
    {path: 'departments', component: BlankComponent, data: {title: 'Departments', indexed: true}},
    {path: 'extensions', component: BlankComponent, data: {title: 'Employees', indexed: true}},
    {path: 'details-and-records', component: BlankComponent, data: {title: 'Details and records', indexed: true}},
    {path: 'invoices', component: BlankComponent, data: {title: 'Invoices', indexed: true}},
    {path: 'storage', component: BlankComponent, data: {title: 'Storage', indexed: true}},
    {path: 'marketplace', component: MarketplaceComponent, data: {title: 'Marketplace', indexed: true}},
    {path: 'settings', component: SettingsComponent, data: {title: 'Settings', indexed: true}},
    {path: 'refill', component: BlankComponent, data: {title: 'Balance refill', indexed: true}},
    {path: 'tariff', component: TariffPlansComponent, data: {title: 'Tariff plan', indexed: true}}
  ]},
  {path: '**', component: PageNotFoundComponent, data: {title: 'Page not found', indexed: false}}
];

@NgModule({
  imports: [
    RouterModule.forRoot(Routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthGuardServices
  ]
})
export class MainRouterModule {  }
