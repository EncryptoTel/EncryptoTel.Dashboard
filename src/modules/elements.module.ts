import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import {ClickOutsideDirective} from '../shared/click-outside.directive';

import {LoaderComponent} from '../elements/pbx-loader/pbx-loader.component';
import {SelectComponent} from '../elements/pbx-select/pbx-select.component';
import {ButtonComponent} from '../elements/pbx-button/pbx-button.component';
import {TariffComponent} from '../elements/pbx-tariff/pbx-tariff.component';
import {TableComponent} from '../elements/pbx-table/pbx-table.component';
import {SidebarComponent} from '../elements/pbx-sidebar/pbx-sidebar.component';
import {CheckboxComponent} from '../elements/pbx-checkbox/pbx-checkbox.component';
import {ModalComponent} from '../elements/pbx-modal/pbx-modal.component';
import {PaginationComponent} from '../elements/pbx-pagination/pbx-pagination.component';
import {NotificatorComponent} from '../elements/pbx-notificator/pbx-notificator.component';
import {FormComponent} from '../elements/pbx-form/pbx-form.component';
import {InputComponent} from '../elements/pbx-input/pbx-input.component';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        AngularSvgIconModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        ClickOutsideDirective,
        LoaderComponent,
        SelectComponent,
        ButtonComponent,
        TariffComponent,
        CheckboxComponent,
        TableComponent,
        SidebarComponent,
        ModalComponent,
        PaginationComponent,
        NotificatorComponent,
        FormComponent,
        InputComponent
    ],
    exports: [
        ClickOutsideDirective,
        LoaderComponent,
        SelectComponent,
        ButtonComponent,
        TariffComponent,
        CheckboxComponent,
        TableComponent,
        SidebarComponent,
        ModalComponent,
        PaginationComponent,
        NotificatorComponent,
        FormComponent,
        InputComponent
    ]
})
export class ElementsModule {
}
