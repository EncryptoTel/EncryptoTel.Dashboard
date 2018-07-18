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
        confirm: { type: string, value: string },
        decline: { type: string, value: string }
    };
    @Input() modalEx: ModalEx;
    @Output() onConfirm: EventEmitter<void> = new EventEmitter<void>();
    @Output() onConfirmEx: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDecline: EventEmitter<void> = new EventEmitter<void>();

    confirm(): void {
        this.onConfirm.emit();
        this.modal.visible = false;
    }

    hideModal(): void {
        this.onDecline.emit();
        if (this.modal) {
            this.modal.visible = false;
        }
        if (this.modalEx) {
            this.modalEx.visible = false;
        }
    }

    clickEx(button: ModalButton): void {
        if (button.type === 'cancel') {
            this.hideModal();
        } else {
            this.onConfirmEx.emit(button);
            this.modalEx.visible = false;
        }
    }

}

export class ModalEx {
    visible: boolean;
    title: string;
    body: string;
    buttons: ModalButton[];

    constructor(body?, create?) {
        this.visible = false;
        this.title = '';
        this.body = body;
        this.buttons = [];
        if (create === 1) {
            this.buttons.push(new ModalButton('error', 'Delete'));
            this.buttons.push(new ModalButton('cancel', 'Cancel'));
        }
    }
}

export class ModalButton {
    tag: number;
    type: string;
    value: string;
    loading: boolean;

    constructor(type?, value?) {
        this.type = type;
        this.value = value;
    }
}
