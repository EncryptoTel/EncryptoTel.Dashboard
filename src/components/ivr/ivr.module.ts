import {NgModule} from '@angular/core';
import { IvrComponent } from "./ivr.component";
import { IvrCreateComponent } from "./ivr-create/ivr-create.component";
import { Routes, RouterModule } from "@angular/router";
import { IvrService } from "@services/ivr.service";
import { ElementsModule } from "@modules/elements.module";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import { IvrLevelFormComponent } from "./ivr-create/ivr-level-form/ivr-level-form";
import { IvrDigitFormComponent } from "./ivr-create/ivr-digit-form/ivr-digit-form";
import { IvrLevelComponent } from "./ivr-create/ivr-level/ivr-level.component";
import { HostIvrFormDirective } from "./ivr-create/directive/host.directive";
import { ModalComponent } from "@elements/pbx-modal/pbx-modal.component";
import { CanDeactivateFormGuard } from '@services/can-deactivate-form-guard.service';

const routes: Routes = [
    {path: '', component: IvrComponent, data: {title: 'IVR', indexed: true}},
    {
        path: 'create',
        component: IvrCreateComponent,
        data: {title: 'Create IVR', indexed: true},
        canDeactivate: [CanDeactivateFormGuard]
    },
    {
        path: ':id',
        component: IvrCreateComponent,
        data: {title: 'Edit IVR', indexed: true},
        canDeactivate: [CanDeactivateFormGuard]
    }
];

@NgModule({
    declarations: [
        IvrComponent,
        IvrCreateComponent,
        IvrLevelComponent,
        IvrLevelFormComponent,
        IvrDigitFormComponent,
        HostIvrFormDirective
    ],
    imports: [
        ElementsModule,
        TranslateModule,
        AngularSvgIconModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    exports:[
        IvrComponent,
        IvrCreateComponent
    ],
    providers: [
        IvrService
    ],
    entryComponents:[
        IvrDigitFormComponent,
        IvrLevelFormComponent,
        ModalComponent
    ]
})
export class IvrModule {
}

