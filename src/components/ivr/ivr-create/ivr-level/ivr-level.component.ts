import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    OnDestroy
} from '@angular/core';

import { FadeAnimation } from '@shared/fade-animation';
import { IvrTreeItem, IvrLevelItem, IvrLevel, Digit } from '@models/ivr.model';
import {
    ModalEx,
    ModalComponent
} from '@elements/pbx-modal/pbx-modal.component';
import { ModalServices } from '@services/modal.service';

@Component({
    selector: 'pbx-ivr-level',
    templateUrl: './ivr-level.component.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class IvrLevelComponent implements OnInit, OnDestroy {
    @Input() level: IvrLevel;
    @Input() isValidForm: boolean;
    @Output() ivrDigitSelected: EventEmitter<Digit> = new EventEmitter<Digit>();
    @Output() ivrLevelSelected: EventEmitter<IvrLevel> = new EventEmitter<IvrLevel>();
    @Output() onCancelEdit: EventEmitter<any> = new EventEmitter<any>();
    modal: ModalEx;
    modalWnd: ModalComponent;
    selectedItem: any;
    constructor(private modalService: ModalServices) {
        this.modal = new ModalEx(
            'Form not saved. This element will be delete. Do you want to continue?',
            'changeTariff'
        );
        this.modalWnd = this.modalService.createModal(this.modal);
    }

    ngOnInit(): void {
        this.selectedItem = this.level;
    }

    onSelectDigit(digit: Digit) {
        if (this.isValidForm) {
            this.selectedItem = digit;
            this.ivrDigitSelected.emit(digit);
        } else {
            this.modal.visible = true;
            this.modalWnd.onConfirmEx.subscribe(() => {
                this.onCancelEdit.emit();
                this.selectedItem = digit;
                this.ivrDigitSelected.emit(digit);
            });
        }
    }

    onSelectLevel() {
        if (this.isValidForm) {
            this.selectedItem = this.level;
            this.ivrLevelSelected.emit(this.level);
        } else {
            this.modal.visible = true;
            this.modalWnd.onConfirmEx.subscribe(() => {
                this.onCancelEdit.emit();
                this.selectedItem = this.level;
                this.ivrLevelSelected.emit(this.level);
            });
        }
    }

    addDigit() {
        const d = new Digit();
        this.level.digits.push(d);
        this.onSelectDigit(d);
        this.isValidForm = false;
    }

    ngOnDestroy(): void {
        this.modalService.deleteModal();
    }
}
