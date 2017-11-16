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
    PageNotFoundComponent,
    IndexComponent,
    SignInComponent,
    SignUpComponent,
    EmailConfirmComponent,
    CodeConfirmComponent
  ],
  exports: [
    PageNotFoundComponent,
    IndexComponent,
    SignInComponent,
    SignUpComponent,
    EmailConfirmComponent,
    CodeConfirmComponent
  ]
})
export class ComponentsModule {  }
