import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SidebarInfoModel} from "../../models/base.model";

@Component({
    selector: 'pbx-sidebar',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class SidebarComponent {
    @Input() sidebarInfo: SidebarInfoModel;
    @Output() onClick: EventEmitter<SidebarInfoModel> = new EventEmitter<SidebarInfoModel>();

    viewItems() {
        return this.sidebarInfo.items.filter(item => item.view);
    }

    click(item) {
        this.onClick.emit(item);
    }

}
