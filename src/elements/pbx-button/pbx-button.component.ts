import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';
import {killEvent} from '../../shared/shared.functions';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-button',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class ButtonComponent implements OnInit {

    @Input() name: string;
    @Input()
    set value(value) {
        this._valueCanonical = value;
        if (value) {
            this._value = this.translate.instant(value);
        }
    }
    _valueCanonical: string;
    _value: string;
    @Input() buttonType: string;
    @Input() buttonClass: string;
    @Input() loading: boolean;
    @Input() inactive: boolean;
    @Input() buttonIcon: string;

    @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('button') button: ElementRef;

    constructor(public translate: TranslateService) {
        if (!this._value) {
            this._value = 'Submit';
        }
        if (!this.buttonType) {
            this.buttonType = 'accent';
        }
    }

    ngOnInit(): void {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            if (this._valueCanonical) {
                this._value = this.translate.instant(this._valueCanonical);
            }
        });
    }

    clicked(event?: MouseEvent): void {
        killEvent(event);

        const div = document.createElement('div');

        const radius = this.button.nativeElement.clientWidth;
        div.style.width = div.style.height = radius + 'px';
        div.style.top = event.offsetY - radius / 2 + 'px';
        div.style.left = event.offsetX - radius / 2 + 'px';
        div.classList.add('button_overlay');
        this.button.nativeElement.appendChild(div);

        if (radius < 150) {
            div.classList.add('small');
            setTimeout(() => {
                // this.button.nativeElement.removeChild(div);
            }, 300);
        }
        else if (radius >= 150 && radius < 300) {
            div.classList.add('medium');
            setTimeout(() => {
                this.button.nativeElement.removeChild(div);
            }, 400);
        }
        else {
            setTimeout(() => {
                this.button.nativeElement.removeChild(div);
            }, 550);
        }

        this.onClick.emit();
    }
}
