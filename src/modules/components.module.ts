import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {AngularSvgIconModule} from 'angular-svg-icon';

import {ElementsModule} from './elements.module';
import {MainRouterModule} from './router.module';

import {PageNotFoundComponent} from '../components/errors/page-not-found/page-not-found.component';

import {IndexComponent} from '../components/index/index.component';
import {SignInComponent} from '../components/sign-in/sign-in.component';
import {SignUpComponent} from '../components/sign-up/sign-up.component';
import {EmailConfirmComponent} from '../components/confirmation/email-confirm.component';
import {CodeConfirmComponent} from '../components/confirmation/code-confirm.component';
import {PasswordRecoveryComponent} from '../components/password-recovery/password-recovery.component';
import {PasswordChangeComponent} from '../components/confirmation/password-change.component';
import {DashboardComponent} from '../components/dashboard/dashboard.component';
import {TariffPlansComponent} from '../components/tariff-plans/tariff-plans.component';
import {SignUpTariffPlansComponent} from '../components/sign-up/tariff-plans/sign-up-tariff-plans.component';
import {SignUpFormComponent} from '../components/sign-up/sign-up-form/sign-up-form.component';
import {BlankComponent} from '../components/blank/blank.component';

/*
  Components declarations and exports
 */

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularSvgIconModule,
    ElementsModule,
    MainRouterModule
  ],
  declarations: [
    PageNotFoundComponent,
    IndexComponent,
    SignInComponent,
    SignUpComponent,
    EmailConfirmComponent,
    CodeConfirmComponent,
    PasswordRecoveryComponent,
    PasswordChangeComponent,
    DashboardComponent,
    TariffPlansComponent,
    SignUpTariffPlansComponent,
    SignUpFormComponent,
    DashboardComponent,
    BlankComponent
  ],
  exports: [
    PageNotFoundComponent,
    IndexComponent,
    SignInComponent,
    SignUpComponent,
    EmailConfirmComponent,
    CodeConfirmComponent,
    PasswordRecoveryComponent,
    PasswordChangeComponent,
    DashboardComponent,
    BlankComponent
  ]
})
export class ComponentsModule {  }
