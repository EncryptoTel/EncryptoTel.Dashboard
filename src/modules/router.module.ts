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
import {PasswordChangeComponent} from '../components/confirmation/password-change.component';
import {DashboardComponent} from '../components/dashboard/dashboard.component';

const Routes: Routes = [
  {path: '', redirectTo: 'cabinet', pathMatch: 'full'},
  {path: 'sign-in', component: SignInComponent, data: {title: 'Sign in', indexed: true}},
  {path: 'sign-up', component: SignUpComponent, data: {title: 'Sign up', indexed: true}},
  {path: 'recovery', component: PasswordRecoveryComponent, data: {title: 'Password recovery', indexed: true}},
  {path: 'email-confirmation/:hash', component: EmailConfirmComponent, data: {title: 'Email confirmation', indexed: false}},
  {path: 'code-confirmation/:hash', component: CodeConfirmComponent, data: {title: 'Code confirmation', indexed: false}},
  {path: 'password-reset/:hash', component: PasswordChangeComponent, data: {title: 'Password reset', indexed: false}},
  {path: 'cabinet', canActivate: [AuthGuardServices], component: IndexComponent, children: [
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent, data: {title: 'Dashboard', indexed: true}},
    {path: 'phone-numbers', component: DashboardComponent, data: {title: 'Phone numbers', indexed: true}},
    {path: 'address-book', component: DashboardComponent, data: {title: 'Address book', indexed: true}},
    {path: 'call-rules', component: DashboardComponent, data: {title: 'Call rules', indexed: true}},
    {path: 'call-queues', component: DashboardComponent, data: {title: 'Call queues', indexed: true}},
    {path: 'ring-groups', component: DashboardComponent, data: {title: 'Ring groups', indexed: true}},
    {path: 'ivr', component: DashboardComponent, data: {title: 'IVR', indexed: true}},
    {path: 'company', component: DashboardComponent, data: {title: 'Company', indexed: true}},
    {path: 'departments', component: DashboardComponent, data: {title: 'Departments', indexed: true}},
    {path: 'employees', component: DashboardComponent, data: {title: 'Employees', indexed: true}},
    {path: 'details-and-records', component: DashboardComponent, data: {title: 'Details and records', indexed: true}},
    {path: 'invoices', component: DashboardComponent, data: {title: 'Invoices', indexed: true}},
    {path: 'storage', component: DashboardComponent, data: {title: 'Storage', indexed: true}},
    {path: 'settings', component: DashboardComponent, data: {title: 'Settings', indexed: true}}
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
