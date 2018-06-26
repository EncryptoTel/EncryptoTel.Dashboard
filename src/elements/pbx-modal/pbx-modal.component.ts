import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-modal',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('200ms')]
})

export class ModalComponent {
  @Input() modal: {
    visible: boolean,
    title: string,
    confirm: {type: string, value: string},
    decline: {type: string, value: string}
  };
  @Input() visible;
  @Output() onConfirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() onDecline: EventEmitter<void> = new EventEmitter<void>();
  confirm(): void {
    this.onConfirm.emit();
    this.modal.visible = false;
  }
  hideModal(): void {
    this.onDecline.emit();
    this.modal.visible = false;
  }
}
