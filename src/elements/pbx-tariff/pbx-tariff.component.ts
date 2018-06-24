import {Component, EventEmitter, Input, Output} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';

@Component({
    selector: 'pbx-tariff',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class TariffComponent {
    @Input() value: any;
    @Input() current: any;
    @Output() onBuy: EventEmitter<void> = new EventEmitter<void>();

    constructor() {

    }

    isCurrentTariff(): boolean {
        return this.value.id === this.current.id;
    }

    tariffStatus(): string {
        return this.current.id === this.value.id ? 'Subscribed' : (this.value.price > 0 ? 'Buy now' : 'Free');
    }

    tariffCost(): string {
        return this.value.price > 0 ? 'From $' + this.value.price +'/monthly' : 'FREE';
    }

    clicked(ev?: MouseEvent): void {
        this.onBuy.emit(this.value);
    }
}
