import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SidebarInfoModel} from "../../models/base.model";
import { ValidationHost } from '../../models/validation-host.model';


@Component({
    selector: 'pbx-sidebar',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})
export class SidebarComponent {
    @Input() sidebarInfo: SidebarInfoModel;
    @Input() errors: any;
    
    @Input() useForm: boolean = false;
    @Input() validationHost: ValidationHost;
    
    @Output() onClick: EventEmitter<SidebarInfoModel> = new EventEmitter<SidebarInfoModel>();
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();


    viewItems() {
        return this.sidebarInfo.items.filter(item => {
            return item.view && (item.link || !this.sidebarInfo.hideEmpty || ((this.isArray(item) && item.value.length > 0) || (!this.isArray(item) && item.value)));
        });
    }

    editItems() {
        return this.sidebarInfo.items.filter(item => 
            item.edit || item.options
        );
    }

    click(item) {
        this.onClick.emit(item);
    }

    isArray(item) {
        // console.log(item.title, JSON.stringify(item.value), Array.isArray(item.value) ? item.value.length : null);
        return Array.isArray(item.value);
    }

    selectItem(item: any): void {
        this.onSelect.emit(item);
    }
}
