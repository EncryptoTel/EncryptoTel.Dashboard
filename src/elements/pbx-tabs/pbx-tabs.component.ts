import { Component, QueryList, ContentChildren, AfterContentInit, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { BaseButton } from '@models/base.model';
import { TabComponent } from './tab/pbx-tab.component';


@Component({
    selector: 'pbx-tabs',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class TabsComponent implements OnInit, AfterContentInit {
    @Input() buttons: BaseButton[];
    @Input()
    set params(dsfasdfa: any) {
        this._params = dsfasdfa;
    }
    _params: any;

    @Output() onClick: EventEmitter<string>;
    @Output() onTabChange: EventEmitter<TabComponent>;

    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

    get selectedTabIndex(): number {
        if (this.tabs) {
            const selectedTab = this.tabs.find(tab => tab.active);
            return selectedTab ? selectedTab.id : 0;
        }
        return 0;
    }

    constructor() {
        this.onClick = new EventEmitter<string>();
        this.onTabChange = new EventEmitter<TabComponent>();
    }

    ngOnInit(): void {}

    ngAfterContentInit(): void {
        let index = 0;
        this.tabs.forEach(tab => tab.id = index ++);
        const activeTabs = this.tabs.filter(tab => tab.active);
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    buttonClick(button: BaseButton): void {
        this.onClick.emit(button.action);
    }

    changeTab(tab: TabComponent): void {
        if (this.onTabChange.observers.length > 0) {
            this.onTabChange.emit(tab);
        }
        else {
            this.selectTab(tab);
        }
    }

    selectTabByIndex(index: number): void {
        if (index < this.tabs.length) {
            const tab = this.tabs.toArray().find(t => t.id === index);
            this.selectTab(tab);
        }
    }

    selectTab(tab: TabComponent): void {
        this.tabs.toArray().forEach(t => t.active = false);
        tab.active = true;
    }
}
