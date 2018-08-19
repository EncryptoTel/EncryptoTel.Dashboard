import { Component, QueryList, ContentChildren, AfterContentInit, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { TabComponent } from "./tab/pbx-tab.component";
import { BaseButton } from "../../models/base.model";

@Component({
    selector: 'pbx-tabs',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class TabsComponent implements OnInit, AfterContentInit {
    @Input() buttons: BaseButton[];

    @Output() onClick: EventEmitter<string>;

    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

    constructor() {
        this.onClick = new EventEmitter<string>();
    }

    ngOnInit(): void {}

    ngAfterContentInit(): void {
        let activeTabs = this.tabs.filter(tab => tab.active);
        if(activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    selectTab(tab: TabComponent): void {
        this.tabs.toArray().forEach(tab => tab.active = false);
        tab.active = true;
    }

    buttonClick(button: BaseButton): void {
        this.onClick.emit(button.action);
    }
}