import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import {IndexComponent} from '../components/index/index.component';
import {SignInComponent} from '../components/sign-in/sign-in.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    IndexComponent,
    SignInComponent
  ],
  exports: [
    IndexComponent,
    SignInComponent
  ]
})
export class ComponentsModule {  }
