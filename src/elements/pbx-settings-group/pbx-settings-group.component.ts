import {Component, OnInit, Input, Output, EventEmitter} from "@angular/core";

import {FadeAnimation} from "../../shared/fade-animation";
import {SwipeAnimation} from "../../shared/swipe-animation";
import {SettingsItem} from "../../models/settings.models";
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-settings-group',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms'), SwipeAnimation('y', '200ms')]
})
export class SettingsGroupComponent implements OnInit {

    @Input() items: SettingsItem[];
    @Input() level: number = 1;

    @Output() valueChange: EventEmitter<SettingsItem> = new EventEmitter<SettingsItem>();

    constructor(public translate: TranslateService) {
    }

    ngOnInit(): void {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            Object.keys(this.items).forEach(item => {
                this.items[item].itemTitle = this.translate.instant(this.items[item].name);
            });
        });

        Object.keys(this.items).forEach(item => {
            this.items[item].itemTitle = this.translate.instant(this.items[item].name);
        });
    }

    onValueChange(item: SettingsItem): void {
        this.valueChange.emit(item);
    }
}
