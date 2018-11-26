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
import { IvrService, DigitActions } from '@services/ivr.service';

@Component({
    selector: 'pbx-ivr-level',
    templateUrl: './ivr-level.component.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class IvrLevelComponent implements OnInit, OnDestroy {
    @Input() level: IvrLevel;
    @Input() isValidForm: boolean;
    @Output() ivrSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCancelEdit: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDeleteLevel: EventEmitter<IvrLevel> = new EventEmitter<IvrLevel>();
    modal: ModalEx;
    modalWnd: ModalComponent;
    selectedItem: any;
    constructor(
        private modalService: ModalServices,
        private service: IvrService
    ) {
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
            this.ivrSelected.emit({level: this.level, digit: this.selectedItem});
        } else {
            this.modal.visible = true;
            this.modalWnd.onConfirmEx.subscribe(() => {
                this.onCancelEdit.emit();
                this.selectedItem = digit;
                this.ivrSelected.emit({level: this.level, digit: this.selectedItem});
            });
        }
    }

    onSelectLevel() {
        if (this.isValidForm) {
            this.selectedItem = this.level;
            this.ivrSelected.emit({level: this.level, digit: undefined});
        } else {
            this.modal.visible = true;
            this.modalWnd.onConfirmEx.subscribe(() => {
                this.onCancelEdit.emit();
                this.selectedItem = this.level;
                this.ivrSelected.emit({level: this.level, digit: this.selectedItem});
            });
        }
    }

    addDigit() {
        const d = new Digit();
        this.level.digits.push(d);
        this.onSelectDigit(d);
        this.isValidForm = false;
    }

    getAction(val) {
        if (val.action) {
            const refVal = this.service.references.params.find(
                x => x.id === val.action.toString()
            );
            return refVal ? refVal.code : '';
        }
        return '';
    }

    getParameter(val) {
        switch (val.action.toString()) {
            case DigitActions.REDIRECT_TO_EXT:
                const sip = this.service.references.sip.find(
                    x => x.id === this.service.currentSip
                );
                if (sip) {
                    const inner = sip.sipInners.find(
                        x => x.id === val.parameter
                    );
                    if (inner) {
                        return inner.phoneNumber;
                    }
                }
                return '';
            case DigitActions.REDIRECT_TO_NUM:
                return val.parameter;
            case DigitActions.REDIRECT_TO_QUEUE:
                const rtq = this.service.references.queue.find(
                    x => x.id === val.parameter
                );
                if (rtq) {
                    return rtq.name;
                }
                return '';
            case DigitActions.REDIRECT_TO_RING_GROUP:
                const rtr = this.service.references.queue.find(
                    x => x.id === val.parameter
                );
                if (rtr) {
                    return rtr.name;
                }
                return '';
            case DigitActions.CANCEL_CALL:
                return '';
            case DigitActions.GO_TO_LEVEL:
                return 'Go to ' + val.parameter;
            case DigitActions.REPEAT_LEVEL:
                return 'repeat ' + val.parameter;
            case DigitActions.REDIRECT_TO_INTEGRATION:
                return '';
            default:
                return '';
        }
    }

    deleteLevel() {
        this.onDeleteLevel.emit(this.level);
    }

    ngOnDestroy(): void {
        this.modalService.deleteModal();
    }
}
