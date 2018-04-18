import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-modal',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('200ms')]
})

export class ModalComponent {
  @Input() visible: boolean;
  @Input() buttons: {
    confirm: {
      type: string,
      title: string,
      loading: boolean
    },
    decline: {
      type: string,
      title: string,
      loading: boolean
    }
  };
  @Output() onConfirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() onDecline: EventEmitter<void> = new EventEmitter<void>();
  constructor() {
    if (!this.buttons) {
      this.buttons = {
        confirm: {type: 'success', title: 'Accept', loading: false},
        decline: {type: 'cancel', title: 'Cancel', loading: false}
      };
    }
  }
  confirm(): void {
    this.onConfirm.emit();
  }
  hideModal(): void {
    this.onDecline.emit();
  }
}
