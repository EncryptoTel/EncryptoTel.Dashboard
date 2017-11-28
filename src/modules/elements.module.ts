import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {AngularSvgIconModule} from 'angular-svg-icon';

import {ClickOutsideDirective} from '../shared/click-outside.directive';

import {LoaderComponent} from '../elements/loader/loader.component';
import {PbxSelectComponent} from '../elements/pbx-select/pbx-select.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AngularSvgIconModule
  ],
  declarations: [
    ClickOutsideDirective,
    LoaderComponent,
    PbxSelectComponent
  ],
  exports: [
    LoaderComponent,
    PbxSelectComponent
  ]
})
export class ElementsModule {  }
