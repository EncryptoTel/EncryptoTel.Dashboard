import {Component, EventEmitter, Input, Output} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-button',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('.3s')]
})

export class ButtonComponent {
  constructor() {}
  @Input() value: string | 'Submit';
  @Input() buttonType: string | 'accent';
  @Input() loading: boolean;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  clicked(ev?: MouseEvent): void {
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }
    this.onClick.emit();
  }
}
