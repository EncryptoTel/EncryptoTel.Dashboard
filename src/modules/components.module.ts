import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import {ElementsModule} from './elements.module';

import {IndexComponent} from '../components/index/index.component';
import {SignInComponent} from '../components/sign-in/sign-in.component';
import {SignUpComponent} from '../components/sign-up/sign-up.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ElementsModule
  ],
  declarations: [
    IndexComponent,
    SignInComponent,
    SignUpComponent
  ],
  exports: [
    IndexComponent,
    SignInComponent,
    SignUpComponent
  ]
})
export class ComponentsModule {  }
