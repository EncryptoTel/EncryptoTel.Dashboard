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
  {path: 'sign-in', component: SignInComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'recovery', component: PasswordRecoveryComponent},
  {path: 'email-confirmation/:hash', component: EmailConfirmComponent},
  {path: 'code-confirmation/:hash', component: CodeConfirmComponent},
  {path: 'password-reset/:hash', component: PasswordChangeComponent},
  {path: 'cabinet', canActivate: [AuthGuardServices], component: IndexComponent, children: [
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent},
    {path: 'phone-numbers', component: DashboardComponent},
    {path: 'address-book', component: DashboardComponent},
    {path: 'call-rules', component: DashboardComponent},
    {path: 'call-queues', component: DashboardComponent},
    {path: 'ring-groups', component: DashboardComponent},
    {path: 'ivr', component: DashboardComponent},
    {path: 'company', component: DashboardComponent},
    {path: 'departments', component: DashboardComponent},
    {path: 'employees', component: DashboardComponent},
    {path: 'details-and-records', component: DashboardComponent},
    {path: 'invoices', component: DashboardComponent},
    {path: 'storage', component: DashboardComponent},
    {path: 'settings', component: DashboardComponent}
  ]},
  {path: '**', component: PageNotFoundComponent}
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
