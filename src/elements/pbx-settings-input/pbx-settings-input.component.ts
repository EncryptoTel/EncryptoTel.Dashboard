import {Component, OnInit, Input} from "@angular/core";

import {FadeAnimation} from "../../shared/fade-animation";
import {SwipeAnimation} from "../../shared/swipe-animation";
import {SettingsItem} from "../../models/settings.models";


@Component({
    selector: 'pbx-settings-input',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms'), SwipeAnimation('y', '200ms')]
})
export class SettingsInputComponent implements OnInit {

    @Input() item: SettingsItem;
    @Input() fullWidth: boolean = true;

    ngOnInit(): void {
        console.log('options', this.item.options);
    }
}
