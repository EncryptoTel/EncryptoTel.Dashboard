import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
    selector: 'pbx-header',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})

export class HeaderComponent {
    @Input() buttons: ButtonItem[];
    @Output() onClick: EventEmitter<ButtonItem> = new EventEmitter<ButtonItem>();

    clickButton(item: ButtonItem) {
        this.onClick.emit(item);
    }

}

export class ButtonItem {
    id: number;
    title: string;
    type: string;
}