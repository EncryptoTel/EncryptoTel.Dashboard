import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {AngularSvgIconModule} from 'angular-svg-icon';

import {ClickOutsideDirective} from '../shared/click-outside.directive';

import {LoaderComponent} from '../elements/pbx-loader/pbx-loader.component';
import {SelectComponent} from '../elements/pbx-select/pbx-select.component';
import {ButtonComponent} from '../elements/pbx-button/pbx-button.component';
import {TableComponent} from '../elements/pbx-table/pbx-table.component';
import {SidebarComponent} from '../elements/pbx-sidebar/pbx-sidebar.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AngularSvgIconModule
  ],
  declarations: [
    ClickOutsideDirective,
    LoaderComponent,
    SelectComponent,
    ButtonComponent,
    TableComponent,
    SidebarComponent
  ],
  exports: [
    ClickOutsideDirective,
    LoaderComponent,
    SelectComponent,
    ButtonComponent,
    TableComponent,
    SidebarComponent
  ]
})
export class ElementsModule {  }
