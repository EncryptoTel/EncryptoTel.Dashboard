import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import {VgStreamingModule} from 'videogular2/streaming';

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
import {HeaderComponent} from '../elements/pbx-header/pbx-header.component';
import {ListComponent} from '../elements/pbx-list/pbx-list.component';
import {DiskUsedComponent} from '../elements/pbx-drive-circle/pbx-drive-circle.component';
import {CalendarComponent} from '../elements/pbx-calendar/pbx-calendar.component';
import {QueueCreateComponent} from "../elements/pbx-queue-create/pbx-queue-create.component";
import {QueueGeneralComponent} from "../elements/pbx-queue-create/general/pbx-queue-general.component";
import {QueueMembersComponent} from "../elements/pbx-queue-create/members/pbx-queue-members.component";
import {QueueMembersAddComponent} from "../elements/pbx-queue-create/members/add/pbx-queue-members-add.component";
import {MediaTableComponent, TimePipe} from '../elements/pbx-media-table/pbx-media-table.component';
import {MediaPlayerComponent} from '../elements/pbx-media-player/pbx-media-player.component';
import {TagSelectorComponent} from '../elements/pbx-tag-selector/pbx-tag-selector.component';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        AngularSvgIconModule,
        FormsModule,
        ReactiveFormsModule,
    	VgCoreModule,
    	VgControlsModule,
    	VgOverlayPlayModule,
    	VgBufferingModule,
    	VgStreamingModule,
    ],
    declarations: [
        ClickOutsideDirective,
        LoaderComponent,
        SelectComponent,
        ButtonComponent,
        TariffComponent,
        CheckboxComponent,
        TableComponent,
        MediaTableComponent,
        TimePipe,
        MediaPlayerComponent,
        SidebarComponent,
        ModalComponent,
        PaginationComponent,
        NotificatorComponent,
        FormComponent,
        InputComponent,
        HeaderComponent,
        ListComponent,
        DiskUsedComponent,
        CalendarComponent,
        QueueCreateComponent,
        QueueGeneralComponent,
        QueueMembersComponent,
        QueueMembersAddComponent,
        TagSelectorComponent,
    ],
    exports: [
        ClickOutsideDirective,
        LoaderComponent,
        SelectComponent,
        ButtonComponent,
        TariffComponent,
        CheckboxComponent,
        TableComponent,
        MediaTableComponent,
        MediaPlayerComponent,
        VgCoreModule,
    	VgControlsModule,
    	VgOverlayPlayModule,
    	VgBufferingModule,
    	VgStreamingModule,
        SidebarComponent,
        ModalComponent,
        PaginationComponent,
        NotificatorComponent,
        FormComponent,
        InputComponent,
        HeaderComponent,
        ListComponent,
        DiskUsedComponent,
        CalendarComponent,
        QueueCreateComponent,
        QueueGeneralComponent,
        QueueMembersComponent,
        QueueMembersAddComponent,
        TagSelectorComponent,
    ]
})
export class ElementsModule {
}
