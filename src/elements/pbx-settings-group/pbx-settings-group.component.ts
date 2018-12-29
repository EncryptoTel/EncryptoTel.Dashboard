import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {LangChangeEvent, TranslateService, TranslatePipe} from '@ngx-translate/core';

import {FadeAnimation} from '@shared/fade-animation';
import {SwipeAnimation} from '@shared/swipe-animation';
import {SettingsItem} from '@models/settings.models';
import {ValidationHost} from '@models/validation-host.model';


@Component({
    selector: 'pbx-settings-group',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms'), SwipeAnimation('y', '200ms')]
})
export class SettingsGroupComponent implements OnInit {

    @Input() items: SettingsItem[];
    @Input() level: number = 1;
    @Input() form: FormGroup;
    @Input() validationHost: ValidationHost;

    @Output() valueChange: EventEmitter<SettingsItem> = new EventEmitter<SettingsItem>();

    constructor(public translate: TranslateService) {
    }

    ngOnInit(): void {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.translateItems();
        });

        this.translateItems();
    }

    onValueChange(item: SettingsItem): void {
        this.valueChange.emit(item);
    }

    translateItems(): void {
        Object.keys(this.items).forEach(index => {
            this.items[index].itemTitle = this.translate.instant(this.items[index].name);
        });
    }
}
