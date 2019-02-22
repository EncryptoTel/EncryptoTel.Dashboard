import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';

import { FadeAnimation } from '@shared/fade-animation';
import { IvrTreeItem, IvrLevelItem, IvrLevel, Digit, DigitActions, MAX_IVR_LEVEL_COUNT } from '@models/ivr.model';
import {
  ModalEx,
  ModalComponent
} from '@elements/pbx-modal/pbx-modal.component';
import { ModalServices } from '@services/modal.service';
import { IvrService } from '@services/ivr.service';
import { IvrFormInterface } from '@components/ivr/ivr-create/form.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'pbx-ivr-level',
  templateUrl: './ivr-level.component.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})
export class IvrLevelComponent implements OnInit, OnDestroy {
  @Input() level: IvrLevel;
  // @Input() isValidForm: boolean;
  @Input() form: IvrFormInterface;
  @Input() editMode: boolean;

  @Output() ivrSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCancelEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDeleteLevel: EventEmitter<IvrLevel> = new EventEmitter<IvrLevel>();

  modal: ModalEx;
  modalWnd: ModalComponent;
  selectedItem: any;

  get levelDescription(): string {
    return !this.level || this.level.levelNum === 1
      ? 'IVR Menu'
      : `Level ${this.level.levelNum - 1}`;
  }

  addDigitButtonVisible(): boolean {
    return this.form.valid && !!this.level && this.level.digits.length < 12;
  }


  constructor(
    private modalService: ModalServices,
    private service: IvrService,
    private _translate: TranslateService
  ) {
    this.modal = new ModalEx(
      this._translate.instant('Form is not saved. This element will be deleted. Do you want to continue?'),
      'delete'
    );
    this.modalWnd = this.modalService.createModal(this.modal);
  }

  ngOnInit(): void {
    this.selectedItem = this.level;
  }

  onSelectDigit(digit: Digit) {
    if (this.form.valid) {
      this.selectedItem = digit;
      this.ivrSelected.emit({ level: this.level, digit: this.selectedItem });
    }
    else {
      this.modal.body = this._translate.instant('Form is not saved. This element will be deleted. Do you want to continue?');
      this.modal.visible = true;
      this.modalWnd.onConfirmEx.subscribe(() => {
        this.onCancelEdit.emit();
        this.selectedItem = digit;
        this.ivrSelected.emit({ level: this.level, digit: this.selectedItem });
      });
    }
  }

  onSelectLevel() {
    if (!this.isCurrentLevel()) {
      if (this.form.valid) {
        this.selectedItem = this.level;
        this.ivrSelected.emit({ level: this.level, digit: undefined });
      }
      else {
        this.modal.visible = true;
        this.modalWnd.onConfirmEx.subscribe(() => {
          this.onCancelEdit.emit();
          this.selectedItem = this.level;
          this.ivrSelected.emit({ level: this.level, digit: undefined });
        });
      }
    }
  }

  private isCurrentLevel() {
    return this.level.levelNum === this.form.data.levelNum;
  }

  addDigit() {
    const d = new Digit();
    this.level.digits.push(d);
    this.onSelectDigit(d);
    // this.form.valid = false; TODO: !!!
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
        if (this.service.references.sip) {
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
        }
        return '';
      case DigitActions.REDIRECT_TO_NUM:
        return val.parameter;
      case DigitActions.REDIRECT_TO_QUEUE:
        if (this.service.references.queue) {
          const rtq = this.service.references.queue.find(
            x => x.id === val.parameter
          );
          if (rtq) {
            return rtq.name;
          }
        }
        return '';
      case DigitActions.REDIRECT_TO_RING_GROUP:
        if (this.service.references.ringGroup) {
          const rtr = this.service.references.ringGroup.find(
            x => x.id === val.parameter
          );
          if (rtr) {
            return rtr.name;
          }
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
    this.modal.body = 'Are you sure want to delete this level?';
    this.modal.visible = true;
    this.modalWnd.onConfirmEx.subscribe(() => {
      this.onDeleteLevel.emit(this.level);
    });
  }

  ngOnDestroy(): void {
    this.modalService.deleteModal();
  }
}
