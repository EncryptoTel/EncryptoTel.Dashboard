import {Component, EventEmitter, Input, Output} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'pbx-tariff',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class TariffComponent {
    @Input() value: any;
    @Input() current: any;
    @Input() loadTariff: boolean;
    @Output() onBuy: EventEmitter<void> = new EventEmitter<void>();

    constructor(public translate: TranslateService) {

    }

    get isCurrent(): boolean {
        return this.value.id === this.current.id;
    }

    get status(): string {
        return this.current.id === this.value.id
            ? this.translate.instant('Subscribed')
            : (this.value.price > 0 ? this.translate.instant('Buy now') : this.translate.instant('Free'));
    }

    get cost(): string {
        return this.value.discountPrice > 0
            ? '<span>$' + this.value.price + '</span> / ' + this.translate.instant('monthly')
            : this.translate.instant('Free');
    }

    get discountPrice(): string {
        return this.value.discountPrice > 0
            ? '<span>$' + this.value.discountPrice + '</span> / ' + this.translate.instant('monthly')
            : '';
    }

    get tariffPrice(): string {
        return this.value.tariffPrice > 0
            ? '<span>$' + this.value.tariffPrice + '</span> / ' + this.translate.instant('monthly')
            : '';
    }

    getServiceTitle(service) {
        return this.translate.instant(service.title);
    }

    clicked(event?: MouseEvent): void {
        this.onBuy.emit(this.value);
    }
}
