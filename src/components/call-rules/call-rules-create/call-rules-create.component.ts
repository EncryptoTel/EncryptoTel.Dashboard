import { Component, OnInit, ViewChild, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FadeAnimation } from '../../../shared/fade-animation';
import { CallRulesService } from '../../../services/call-rules.service';
import { Action, SipInner, SipItem, CallRulesItem } from '../../../models/call-rules.model';
import { StorageService } from '../../../services/storage.service';
import { MessageServices } from '../../../services/message.services';
import { MediaPlayerComponent } from '../../../elements/pbx-media-player/pbx-media-player.component';
import { CdrMediaInfo, MediaState } from '../../../models/cdr.model';
import { redirectToExtensionValidator, numberRangeValidator, callRuleTimeValidator, durationTimeValidator, callRuleParameterValidator } from '../../../shared/encry-form-validators';
import { callRuleNameRegExp } from '../../../shared/vars';
import { FormBaseComponent } from '../../../elements/pbx-form-base-component/pbx-form-base-component.component';
import { isValidId } from '../../../shared/shared.functions';
import { Subscription } from 'rxjs/Subscription';
import { WsServices } from '@services/ws.services';
import { TranslateService } from '@ngx-translate/core';
import { InputComponent } from '@elements/pbx-input/pbx-input.component';


@Component({
  selector: 'pbx-call-rules-create',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')],
  providers: [StorageService]
})
export class CallRulesCreateComponent extends FormBaseComponent implements OnInit, OnDestroy {

  callRule: CallRulesItem;

  actionsList: Action[];
  currentMediaStream: string = '/assets/mp3/silence.mp3';
  files = [];
  mode = 'create';
  numbers: SipItem[];
  queues = [];
  groups = [];
  playButtonTexts: string[] = [];
  selectedMediaIndex: number;
  selectedMediaId: number;
  ruleActions = [];
  selectedActions: Action[] = [];
  selectedFiles = [];
  selectedNumber: SipItem;
  selectedQueues = [];
  selectedGroups = [];
  selectedSipInners: SipInner[] = [];
  sipInners: SipInner[] = [];

  loading: number = 0;
  loadingStuff: number = 0;
  saving: number = 0;
  canPlay: boolean = true;

  storageItemSubscription: Subscription;
  uploadFileSubscription: Subscription;
  names: any;
  lastUploadedFile: any;
  lastUploadedIndex: number;

  @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;
  @ViewChild('checkEnable') checkEnable: InputComponent;
  @ViewChildren('voiceGreeting') voiceGreetings: QueryList<InputComponent>;

  // -- properties ----------------------------------------------------------

  get modelEdit(): boolean {
    return isValidId(this.callRule.id);
  }

  get queuePlaceholder(): string {
    return this.queues.length === 0 ? 'noneOfQueues' : '[choose one]';
  }

  get groupPlaceholder(): string {
    return this.queues.length === 0 ? 'noneOfGroups' : '[choose one]';
  }

  // -- component lifecycle methods -----------------------------------------

  constructor(private service: CallRulesService,
    protected fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storage: StorageService,
    protected message: MessageServices,
    private _ws: WsServices,
    public translate: TranslateService
  ) {
    super(fb, message, translate);

    this.callRule = new CallRulesItem();
    this.callRule.id = activatedRoute.snapshot.params.id;

    this.mode = this.callRule.id ? 'edit' : 'create';

    this.validationHost.customMessages = [
      {
        key: 'name', error: 'pattern', message: this.translate
          .instant('Rule name contains invalid characters or symbols. You can only use letters, numbers and the following characters: -_')
      },
      { key: 'sipId', error: 'required', message: this.translate.instant('Please choose the Phone number') },
      { key: 'ruleActions', error: 'required', message: this.translate.instant('Please choose the Action') },
      { key: 'ruleActions.*.timeout', error: 'required', message: this.translate.instant('Please enter a value from 5 to 300') },
      { key: 'ruleActions.*.timeout', error: 'range', message: this.translate.instant('Please enter a value from 5 to 300') },
      { key: 'ruleActions.*.callRuleTime', error: 'days', message: this.translate.instant('Please enter at least one day of the week') },
      { key: 'ruleActions.*.durationTime', error: 'startTime', message: this.translate.instant('Start time cannot be greater than end time') },
      { key: 'ruleActions.*.durationTime', error: 'equalTime', message: this.translate.instant('Start time cannot be the same as end time') },
      { key: 'ruleActions.*.durationTime', error: 'invalidRange', message: this.translate.instant('Invalid time range format') },
      { key: 'ruleActions.*.parameter', error: 'pattern', message: this.translate.instant('External number contains invalid characters. You can use numbers only') },
      { key: 'ruleActions.*.parameter', error: 'minlength', message: this.translate.instant('External number is too short. Use at least 6 numbers') },
      { key: 'ruleActions.*.parameter', error: 'maxlength', message: this.translate.instant('External number is too long. Use no more than 16 numbers') },
      { key: 'ruleActions.*.parameter', error: 'duplicated', message: this.translate.instant('You can not redirect to the same extension 2 times in a row') },
      { key: 'ruleActions.*.parameter', error: 'extensionRequired', message: this.translate.instant('Please choose the Extension number') },
      { key: 'ruleActions.*.parameter', error: 'callQueueRequired', message: this.translate.instant('Please choose the Call Queue') },
      { key: 'ruleActions.*.parameter', error: 'voiceFileRequired', message: this.translate.instant('Please choose the Voice Greeting') },
      { key: 'ruleActions.*.parameter', error: 'callGroupRequired', message: this.translate.instant('Please choose the Ring Group') },
    ];
  }

  ngOnInit(): void {
    this.loading++;

    super.ngOnInit();
    super.setFormData(this.callRule);
    this.getParams();

    const $this: any = this;
    this.storageItemSubscription = this._ws
      .updateStorageItem()
      .subscribe(result => {
        const storageItem: any = $this.selectedFiles.find(item => item.id === result.id);
        if (result.converted === 1) {
          storageItem.converted = result.converted;
        }
      });

    this.uploadFileSubscription = this.storage.uploadedFile
      .subscribe(f => {
        this.lastUploadedFile = f;
      });

    this.names = {
      enableRule: this.translate.instant('Enable Rule'),
      ruleName: this.translate.instant('Rule Name'),
    };

    this.loading--;
  }

  ngOnDestroy(): void {
    this.storageItemSubscription.unsubscribe();
    this.uploadFileSubscription.unsubscribe();
  }

  // -- form setup and helpers methods --------------------------------------

  initForm(): void {
    this.form = this.fb.group({
      id: [null],
      enabled: [false],
      name: [null, [Validators.required, Validators.maxLength(150), Validators.pattern(callRuleNameRegExp)]],
      description: [null, [Validators.maxLength(255)]],
      sipId: [null, [Validators.required]],
      ruleActions: this.fb.array([], Validators.required),
    }, {
        validator: (formGroup: FormGroup) => {
          return redirectToExtensionValidator(formGroup);
        }
      });
  }

  get callRulesForm(): FormGroup {
    return this.form;
  }

  get actionsControls(): FormArray {
    return <FormArray>this.callRulesForm.get('ruleActions');
  }

  get timeRulesControl(): FormGroup {
    return <FormGroup>this.callRulesForm.get('timeRules');
  }

  getActionFormKey(index: number, last: boolean = false): string {
    const control = this.actionsControls.get([index, 'parameter']);
    const key = !control && !last ? 'ruleActions' : '';
    return key;
  }

  private createRedirectToExternalNumber(): FormGroup {
    return this.fb.group({
      action: 2,
      parameter: [null, [Validators.minLength(6), Validators.maxLength(16), Validators.pattern('[0-9]*'), Validators.required]],
      timeout: [30, [Validators.required, Validators.pattern('[0-9]*'), numberRangeValidator(5, 300)]],
      timeRules: ['', []],
      callRuleTime: ['', [callRuleTimeValidator]],
      durationTime: ['', [durationTimeValidator]],
    });
  }

  private createRedirectToExtensionNumber(): FormGroup {
    return this.fb.group({
      action: 1,
      parameter: [null, [callRuleParameterValidator(1)]],
      timeout: [30, [Validators.required, Validators.pattern('[0-9]*'), numberRangeValidator(5, 300)]],
      timeRules: ['', []],
      callRuleTime: ['', [callRuleTimeValidator]],
      durationTime: ['', [durationTimeValidator]],
    });
  }

  private createRedirectToQueue(): FormGroup {
    return this.fb.group({
      action: 3,
      parameter: [null, [callRuleParameterValidator(3)]],
      timeout: [30, [Validators.required, Validators.pattern('[0-9]*'), numberRangeValidator(5, 300)]],
      timeRules: ['', []],
      callRuleTime: ['', [callRuleTimeValidator]],
      durationTime: ['', [durationTimeValidator]],
    });
  }

  private createRedirectToGroup(): FormGroup {
    return this.fb.group({
      action: 6,
      parameter: [null, [callRuleParameterValidator(6)]],
      timeout: [30, [Validators.required, Validators.pattern('[0-9]*'), numberRangeValidator(5, 300)]],
      timeRules: ['', []],
      callRuleTime: ['', [callRuleTimeValidator]],
      durationTime: ['', [durationTimeValidator]],
    });
  }

  private createCancelCall(): FormGroup {
    return this.fb.group({
      action: 4,
      parameter: [null],
      timeout: [30, [numberRangeValidator(5, 300)]],
    });
  }

  private createPlayVoiceFile(): FormGroup {
    return this.fb.group({
      action: 5,
      parameter: [null, [callRuleParameterValidator(5)]],
      timeout: [30, [Validators.required, Validators.pattern('[0-9]*'), numberRangeValidator(5, 300)]],
      timeRules: ['', []],
      callRuleTime: ['', [callRuleTimeValidator]],
      durationTime: ['', [durationTimeValidator]],
    });
  }

  private formatForEdit(ruleActions): void {
    if (!ruleActions) {
      return;
    }
    Object.keys(ruleActions).forEach((actionIdx, index) => {
      this.actionsList.forEach(act => {
        if (act.id === ruleActions[actionIdx].action) {
          this.selectedActions.push(act);
        }
      });
      switch (ruleActions[actionIdx].action) {
        case 1: // Redirect to extension number
          this.addAction(this.actionFactory(1), index);

          this.sipInners.forEach((sipInner: SipInner) => {
            if (sipInner.id.toString() === ruleActions[actionIdx].parameter) {
              this.selectedSipInners[index] = sipInner;
            }
          });
          break;
        case 2: // Redirect to external number
          this.addAction(this.actionFactory(2), index);
          break;
        case 3: // Redirect to call queue
          this.addAction(this.actionFactory(3), index);

          this.queues.forEach(queue => {
            if (queue.id.toString() === ruleActions[actionIdx].parameter) {
              this.selectedQueues[index] = queue;
            }
          });
          break;
        case 6: // Redirect to call queue
          this.addAction(this.actionFactory(6), index);

          this.groups.forEach(group => {
            if (group.id.toString() === ruleActions[actionIdx].parameter) {
              this.selectedGroups[index] = group;
            }
          });
          break;
        case 4: // Terminate call
          this.addAction(this.actionFactory(4), index);
          break;
        case 5: // Play voice file
          this.addAction(this.actionFactory(5), index);

          this.files.forEach(file => {
            if (file.id.toString() === ruleActions[actionIdx].parameter) {
              this.selectedFiles[index] = file;
            }
          });
          break;
        default:
          break;
      }
    });
  }

  actionFactory(actionId: number): FormGroup {
    switch (actionId) {
      case 1:
        return this.createRedirectToExtensionNumber();
      case 2:
        return this.createRedirectToExternalNumber();
      case 3:
        return this.createRedirectToQueue();
      case 4:
        return this.createCancelCall();
      case 5:
        return this.createPlayVoiceFile();
      case 6:
        return this.createRedirectToGroup();
    }
    return null;
  }

  private addAction(actionGroup: FormGroup, index: number): void {
    this.actionsControls.setControl(index, actionGroup);
    this.fillActionFormData(actionGroup.get('action').value, index);
    this.playButtonTexts[index] = 'Play';

    this.validationHost.initItems();
  }

  fillActionFormData(actionId: number, index: number): void {
    if (this.ruleActions && Object.keys(this.ruleActions).length > 0) {
      const key = Object.keys(this.ruleActions)[index];
      if (key && this.ruleActions[key].action === actionId) {
        this.actionsControls.at(index).patchValue(this.ruleActions[key]);
        this.updateTimeRulesFormData(this.ruleActions[key], index);
      }
    }
  }

  getAvailableAction() {
    if (this.selectedNumber.providerId === 1) {
      return this.actionsList.filter(x => x.id !== 2);
    }
    return this.actionsList;
  }

  updateTimeRulesFormData(action: any, index: number): void {
    const timeRules = action.timeRules.split('|');
    this.actionsControls.get([index, 'callRuleTime']).setValue(timeRules[1]);
    this.actionsControls.get([index, 'durationTime']).setValue(timeRules[0]);
  }

  // -- event handlers ------------------------------------------------------

  toggleEnableRule(value: boolean): void {
    if (value) {
      this.service
        .checkCallRuleEnableAvailable(this.selectedNumber.phoneNumber)
        .then(result => {
          if (result && result.itemsCount > 0) {
            this.showWarningModal(
              this.translate.instant('callRuleInUse', { name: result.items[0].name }),
              () => { },
              () => {
                this.checkEnable.checkBoxClick(false);
              }
            );
          }
        });
    }
  }

  selectAction(action: Action, index: number = 0): void {
    this.selectedActions[index] = action;
    this.addAction(this.actionFactory(action.id), index);
    this.resetParameterControlState(index);
  }

  checkNextAction(index: number) {
    let valid: boolean = true;
    if ([2, 3, 4, 6].includes(this.selectedActions[index].id)) {
      valid = false;
    }
    if (!valid && this.actionsControls.length - 1 > index) {
      for (let i = this.actionsControls.length - 1; i >= index; i--) {
        this.deleteAction(i);
      }
    }
    return valid;
  }

  deleteAction(index: number): void {
    this.selectedActions.splice(index, 1);
    this.actionsControls.removeAt(index);
    if (index === 0 && this.selectedActions.length === 0) {
      this.actionsControls.markAsUntouched();
    }
  }

  selectNumber(number: SipItem): void {
    this.selectedNumber = number;
    this.form.get('sipId').setValue(number.id);

    this.getExtensions(number.id);

    this.actionsControls.controls.forEach((group: FormGroup, i: number) => {
      if (group.value.action === 1) {
        group.controls.parameter.setValue(null);
        group.controls.parameter.markAsUntouched();
        this.selectedSipInners[i] = null;
      }
    });
  }

  selectSipInner(index: number, sipInner: SipInner): void {
    this.selectedSipInners[index] = sipInner;
    this.setParameterControlValue(index, sipInner.id);
  }

  selectQueue(index: number, queue): void {
    this.selectedQueues[index] = queue;
    this.setParameterControlValue(index, queue.id);
  }

  selectGroup(index: number, group): void {
    this.selectedGroups[index] = group;
    this.setParameterControlValue(index, group.id);
  }

  selectFile(index: number, file: any): void {
    if (file.converted !== 1) {
      this.canPlay = false;
    }
    if (this.mediaPlayer.selectedMediaId !== file.id && this.mediaPlayer.state === MediaState.PLAYING) {
      this.stopPlayerPlay();
    }
    this.selectedFiles[index] = file;
    this.setParameterControlValue(index, file.id);
  }

  isFileSelected(index: number): boolean {
    return !!this.selectedFiles[index]
      && this.selectedFiles[index].converted != null
      && this.selectedFiles[index].converted > 0;
  }

  setParameterControlValue(index: number, value: any): void {
    this.actionsControls.get([index, 'parameter']).setValue(value);
    const control = <FormControl>this.actionsControls.get([index, `parameter`]);
    if (!control.valid) {
      control.markAsTouched();
    }
  }

  resetParameterControlState(index: number): void {
    const control = <FormControl>this.actionsControls.get([index, `parameter`]);
    if (control) control.markAsUntouched();
  }

  onTimeRuleChange(index, event) {
    this.actionsControls.get([index, 'timeRules']).setValue(event);
  }

  save(): void {
    if (this.validateForms()) {
      this.saveCallRule();
    }
    else {
      this.scrollToFirstError();
    }
  }

  cancel(): void {
    this.router.navigate(['cabinet', 'call-rules']);
  }

  uploadFile(event: any, index: number): void {
    event.preventDefault();

    this.lastUploadedIndex = index;
    const file = event.target.files[0];
    event.target.value = '';
    if (file) {
      if (this.storage.checkCompatibleType(file)) {
        this.storage.checkFileExists(
          file,
          (loading) => {
            if (!this.storage.loading) {
              this.refreshFiles(loading);
            }
          });
      }
      else {
        this.message.writeError(this.translate.instant('Accepted formats: mp3, ogg, wav'));
      }
      this.storage.checkModal();
    }
  }

  togglePlay(order: number): void {
    const fileId = this.actionsControls.get([`${order}`, `parameter`]).value;
    const forceReload: boolean =
      order !== this.selectedMediaIndex && fileId === this.selectedMediaId;

    Object.keys(this.playButtonTexts).forEach(index => {
      if (+index !== order) this.playButtonTexts[index] = 'Play';
    });

    if (fileId) {
      this.selectedMediaIndex = order;
      this.selectedMediaId = fileId;
      this.mediaPlayer.togglePlay(fileId, forceReload);
    }
  }

  stopPlayerPlay(): void {
    this.mediaPlayer.stopPlay();
  }

  getMediaData(fileId: number): void {
    this.mediaPlayer.locker.lock();

    this.storage.getMediaData(fileId)
      .then((media: CdrMediaInfo) => {
        this.currentMediaStream = media.fileLink;
      })
      .catch(error => {
        console.log(error);
        const file = this.selectedFiles.find(f => +f.id === +fileId);
        if (file) { file.converted = null; }
        this.mediaStateChanged(MediaState.PAUSED);
        this.mediaPlayer.locker.unlock();
      })
      .then(() => {
        this.mediaPlayer.locker.unlock();
      });
  }

  mediaStateChanged(state: MediaState): void {
    switch (state) {
      case MediaState.LOADING:
        this.playButtonTexts[this.selectedMediaIndex] = 'Loading';
        break;
      case MediaState.PLAYING:
        this.playButtonTexts[this.selectedMediaIndex] = 'Pause';
        break;
      case MediaState.PAUSED:
      default:
        this.playButtonTexts[this.selectedMediaIndex] = 'Play';
        break;
    }
  }

  // -- data processing methods ---------------------------------------------

  private getCallRule(): void {
    this.loading++;

    this.service.getById(this.callRule.id)
      .then(response => {
        this.setFormData(response);
        this.form.get('sipId').valueChanges.subscribe(() => {
          this.selectedSipInners = [];
        });
      })
      .catch(() => { })
      .then(() => this.loading--);
  }

  setFormData(data: any): void {
    const { id, enabled, description, name, sip, ruleActions } = data;

    this.callRulesForm.get('id').setValue(id);
    this.callRulesForm.get('description').setValue(description);
    this.callRulesForm.get('name').setValue(name);
    this.callRulesForm.get('enabled').setValue(enabled);

    this.ruleActions = ruleActions;
    const currentNumber = this.numbers.find(n => n.id === sip.id);
    this.selectNumber(currentNumber);
  }

  saveCallRule(): void {
    this.saving++;

    if (this.mode === 'create') {
      this.service.save({ ...this.callRulesForm.value })
        .then(() => {
          const okMessage: string = this.translate.instant('Call Rule has been created successfully');
          this.message.writeSuccess(okMessage);

          this.saveFormState();
          this.cancel();
        })
        .catch(() => { })
        .then(() => this.saving--);
    }
    else if (this.mode === 'edit') {
      this.service.edit(this.activatedRoute.snapshot.params.id, { ...this.callRulesForm.value })
        .then(() => {
          const okMessage: string = this.translate.instant('The changes have been saved successfully');
          this.message.writeSuccess(okMessage);

          this.saveFormState();
        })
        .catch(() => { })
        .then(() => this.saving--);
    }
  }

  private getExtensions(id: number): void {
    this.loadingStuff++;

    this.service.getExtensions(id).then(response => {
      this.sipInners = response.items;
      this.formatForEdit(this.ruleActions);
      this.saveFormState();
    }).catch(() => {
    }).then(() => this.loadingStuff--);
  }

  private getParams(): void {
    this.loading++;
    this.service.getParams().then(response => {
      this.actionsList = response.actions;
      this.actionsList.forEach(item => {
        item.code = this.translate.instant(item.code);
      });
      response.actions.map(action => {
        switch (action.id) {
          case 1:
            this.getNumbers();
            break;
          case 3:
            this.getQueue();
            break;
          case 6:
            this.getGroup();
            break;
          case 5:
            this.getFiles();
            break;
        }
      });
    }).catch(() => {
    }).then(() => this.loading--);
  }

  private getFiles(): void {
    this.loading++;
    this.service.getFiles()
      .then((response) => {
        this.files = response.items;
        if (this.mode === 'edit') {
          this.getCallRule();
        }
      })
      .catch(() => { })
      .then(() => this.loading--);
  }

  private getNumbers(): void {
    this.loading++;
    this.service.getOuters()
      .then(response => {
        response.forEach(item => {
          if (item.providerId !== 1) {
            item.phoneNumber = '+' + item.phoneNumber;
          }
        });
        this.numbers = response;
      })
      .catch(() => { })
      .then(() => this.loading--);
  }

  private getQueue(): void {
    this.loading++;
    this.service.getQueue()
      .then(response => {
        this.queues = response.items;
      })
      .catch(() => { })
      .then(() => this.loading--);
  }

  private getGroup(): void {
    this.loading++;
    this.service.getGroup()
      .then(response => {
        this.groups = response.items;
      })
      .catch(() => { })
      .then(() => this.loading--);
  }

  refreshFiles(loading: number): void {
    if (loading) return;

    this.storage.loading++;

    this.service.getFiles()
      .then((response) => {
        this.files = response.items;

        this.voiceGreetings.forEach((ctrl, i) => {
          if (i === this.lastUploadedIndex) {
            ctrl.value = this.lastUploadedFile;
            this.actionsControls
              .at(i)
              .get('parameter')
              .setValue(this.lastUploadedFile.id);
          } else {
            ctrl.value = this.files.find(f => f.id === ctrl.value.id);
          }
        });
      })
      .catch(() => { })
      .then(() => this.storage.loading--);
  }
}
