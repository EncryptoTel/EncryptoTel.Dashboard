import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {AngularSvgIconModule} from 'angular-svg-icon';

import {ElementsModule} from './elements.module';
import {MainRouterModule} from './router.module';

import {IndexComponent} from '../components/index/index.component';
import {SignInComponent} from '../components/sign-in/sign-in.component';
import {SignUpComponent} from '../components/sign-up/sign-up.component';
import {EmailConfirmComponent} from '../components/email-confirm/email-confirm.component';

/*
  Components declarations and exports
 */

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ElementsModule,
    AngularSvgIconModule,
    MainRouterModule
  ],
  declarations: [
    IndexComponent,
    SignInComponent,
    SignUpComponent,
    EmailConfirmComponent
  ],
  exports: [
    IndexComponent,
    SignInComponent,
    SignUpComponent,
    EmailConfirmComponent
  ]
})
export class ComponentsModule {  }
