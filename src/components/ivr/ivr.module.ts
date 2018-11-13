import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import {NgModule} from '@angular/core';
import { IvrComponent } from "./ivr.component";
import { IvrCreateComponent } from "./ivr-create/ivr-create.component";
import { Routes, RouterModule } from "@angular/router";
import { IvrService } from "@services/ivr.service";
import { ElementsModule } from "@modules/elements.module";
import { CommonModule } from "@angular/common";
import { IvrLevelComponent } from "./ivr-level/ivr-level.component";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import { IvrMainFormComponent } from "./ivr-create/ivr-main-form/ivr-main-form";

const routes: Routes = [
    {path: '', component: IvrComponent, data: {title: 'IVR', indexed: true}},
    {
        path: 'create',
        component: IvrCreateComponent,
        data: {title: 'Create IVR', indexed: true},
    },
    {
        path: ':id',
        component: IvrCreateComponent,
        data: {title: 'Edit IVR', indexed: true},
    }

]

@NgModule({
    declarations: [
        IvrComponent,
        IvrCreateComponent,
        IvrLevelComponent,
        IvrMainFormComponent
    ],
    imports: [
        BsDatepickerModule,
        ElementsModule,
        TranslateModule,
        AngularSvgIconModule,
        FormsModule,
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports:[
        IvrComponent,
        IvrCreateComponent
    ],
    providers: [
        IvrService
    ]
})
export class IvrModule {
}

