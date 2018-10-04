import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesService} from '../../../services/call-rules.service';
import {Action, SipInner, SipItem, CallRulesItem} from '../../../models/call-rules.model';
import {StorageService} from '../../../services/storage.service';
import {MessageServices} from '../../../services/message.services';
import {MediaPlayerComponent} from '../../../elements/pbx-media-player/pbx-media-player.component';
import {CdrMediaInfo, MediaState} from '../../../models/cdr.model';
import {redirectToExtensionValidator, numberRangeValidator} from '../../../shared/encry-form-validators';
import {callRuleNameRegExp} from '../../../shared/vars';
import {FormBaseComponent} from '../../../elements/pbx-form-base-component/pbx-form-base-component.component';
import {isValidId} from '../../../shared/shared.functions';


@Component({
    selector: 'pbx-call-rules-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})
export class CallRulesCreateComponent extends FormBaseComponent implements OnInit {

    callRule: CallRulesItem;

    actionsList: Action[];
    currentMediaStream: string = '/assets/mp3/rington.mp3';
    files = [];
    mode = 'create';
    numbers: SipItem[];
    queues = [];
    playButtonText: string;
    ruleActions;
    selectedActions: Action[] = [];
    selectedFiles = [];
    selectedNumber: SipItem;
    selectedQueues = [];
    selectedSipInners: SipInner[] = [];
    sipInners: SipInner[] = [];
    timeRulePattern = /(\*|[0-9]*:[0-9]*-[0-9]*:[0-9]*)\|(\*|(sun|mon|tue|wed|thu|fri|sat)(&(sun|mon|tue|wed|thu|fri|sat))*)\|(\*|[0-9]*)\|(\*|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(&(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))*)/;

    loading: number = 0;
    loadingStuff: number = 0;
    saving: number = 0;

    @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;

    // -- properties ----------------------------------------------------------

    get editMode(): boolean {
        return isValidId(this.callRule.id);
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(private service: CallRulesService,
                protected fb: FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private storage: StorageService,
                protected message: MessageServices) {
        super(fb, message);

        this.callRule = new CallRulesItem();
        this.callRule.id = activatedRoute.snapshot.params.id;
        
        this.mode = this.callRule.id ? 'edit' : 'create';
        this.playButtonText = 'Play';

        this.validationHost.customMessages = [
            { name: 'Rule Name', error: 'pattern', message: 'Rule Name may contain letters, digits, dashes and underscores only' },
            { name: 'Action', error: 'required', message: 'Please choose an action' },
            { name: 'If I do not answer call within', error: 'range', message: 'Please enter value between 5 and 300' },
            { name: 'Action applies for', error: 'days', message: 'Please select at least one day' },
            { name: 'Duration time', error: 'startTime', message: 'Start time cannot be greater than end time' },
            { name: 'Duration time', error: 'equalTime', message: 'Start time and end time cannot be the same' },
        ];
    }

    ngOnInit() {
        this.loading ++;

        super.ngOnInit();
        this.setFormData(this.callRule);
        this.getParams();
        
        this.loading --;
    }

    // -- form setup and helpers methods --------------------------------------

    initForm(): void {
        this.form = this.fb.group({
            id:             [null],
            enabled:        [false],
            name:           [null, [ Validators.required, Validators.maxLength(150), Validators.pattern(callRuleNameRegExp) ]],
            description:    [null, [ Validators.maxLength(255) ]],
            sipId:          [null, [ Validators.required ]],
            ruleActions:    this.fb.array([], Validators.required),
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

    private addAction(actionGroup: FormGroup, i: number): void {
        this.actionsControls.setControl(i, actionGroup);
        this.validationHost.initItems();
    }

    private createCancelCall(): FormGroup {
        return this.fb.group({
            action:      4,
            parameter:  [null],
            timeout:    [30, [Validators.min(5), Validators.max(300)]],
        });
    }

    private createRedirectToExternalNumber(): FormGroup {
        return this.fb.group({
            action:      2,
            parameter:  [null, [Validators.minLength(6), Validators.maxLength(16), Validators.pattern('[0-9]*'), Validators.required]],
            timeout:    [30,   [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules:  ['',   [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    /* ~ */ private createRedirectToExtensionNumber(): FormGroup {
        return this.fb.group({
            action:      1,
            parameter:  [null, [Validators.required]],
            timeout:    [30, [Validators.pattern('[0-9]*'), numberRangeValidator(5, 300)]],
            timeRules:  ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    private createRedirectToQueue(): FormGroup {
        return this.fb.group({
            action:      3,
            parameter:  [null, [Validators.required]],
            timeout:    [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules:  ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    private createPlayVoiceFile(): FormGroup {
        return this.fb.group({
            action:      5,
            parameter:  [null, [Validators.required]],
            timeout:    [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules:  ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    // -- event handlers ------------------------------------------------------

    selectAction(action: Action, index: number = 0): void {
        this.selectedActions[index] = action;
        switch (action.id) {
            case 1: this.addAction(this.createRedirectToExtensionNumber(), index); break;
            case 2: this.addAction(this.createRedirectToExternalNumber(), index); break;
            case 3: this.addAction(this.createRedirectToQueue(), index); break;
            case 4: this.addAction(this.createCancelCall(), index); break;
            case 5: this.addAction(this.createPlayVoiceFile(), index); break;
            default:
                break;
        }
    }

    checkNextAction(index: number) {
        let valid = [1, 5].includes(this.selectedActions[index].id);
        if (!valid && this.actionsControls.length - 1 > index) {
            for (let i = this.actionsControls.length - 1; i >= index; i--) {
                this.deleteAction(i);
            }
        }
        return valid;
    }

    deleteAction(index: number): void {
        this.selectedActions.splice(index + 1, 1);
        this.actionsControls.removeAt(index + 1);
        // this.ruleTimeAsterisk.splice(index + 1, 1);
    }

    selectNumber(number: SipItem): void {
        this.selectedNumber = number;
        this.form.get('sipId').setValue(number.id);
        this.getExtensions(number.id);
    }

    selectSipInner(i: number, sipInner: SipInner): void {
        this.selectedSipInners[i] = sipInner;
        this.actionsControls.get([`${i}`, `parameter`]).setValue(sipInner.id);
    }

    selectQueue(i: number, queue): void {
        this.selectedQueues[i] = queue;
        this.actionsControls.get([`${i}`, `parameter`]).setValue(queue.id);
    }

    selectFile(index: number, file: any): void {
        if (this.mediaPlayer.selectedMediaId != file.id && this.mediaPlayer.state == MediaState.Playing) {
            this.stopPlayerPlay();
        }
        this.selectedFiles[index] = file;
        this.actionsControls.get([`${index}`, `parameter`]).setValue(file.id);
    }

    onTimeRuleChange(index, event) {
        this.actionsControls.get([index, 'timeRules']).setValue(event);
        // console.log('form', this.form.value, this.form);
    }

    save(): void {
        console.log('form', this.form.value, this.form);
        if (!this.validateForms()) return;
        this.saveCallRule();
    }

    cancel(): void {
        this.close(this.editMode, () => this.cancelConfirm());
    }

    cancelConfirm(): void {
        this.router.navigate(['cabinet', 'call-rules']);
    }

    uploadFile(event: any): void {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            if (this.storage.checkCompatibleType(file)) {
                this.storage.checkFileExists(
                    file,
                    (loading) => {
                        if (!this.storage.loading) this.refreshFiles(loading);
                    });
            }
            else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
            this.storage.checkModal();
        }
    }

    togglePlay(i: number): void {
        let fileId = this.actionsControls.get([`${i}`, `parameter`]).value;
        if (fileId) {
            this.mediaPlayer.togglePlay(fileId);
        }
    }

    stopPlayerPlay(): void {
        this.mediaPlayer.stopPlay();
    }

    getMediaData(fileId: number): void {
        this.storage.getMediaData(fileId)
            .then((media: CdrMediaInfo) => {
                this.currentMediaStream = media.fileLink;
            })
            .catch(error => {
                console.log(error);
                // Error handling here ...
            });
    }

    mediaStateChanged(state: MediaState): void {
        switch (state) {
            case MediaState.Loading:
                this.playButtonText = 'Loading';
                break;
            case MediaState.Playing:
                this.playButtonText = 'Pause';
                break;
            case MediaState.Paused:
            default:
                this.playButtonText = 'Play';
                break;
        }
    }

    // -- component methods ---------------------------------------------------

    getActionFormKey(index: number, last: boolean = false): string {
        let control = this.actionsControls.get([index, 'parameter']);
        let key = !control && !last ? 'ruleActions' : '';
        return key;
    }

    private formatForEdit(ruleActions): void {
        if (!ruleActions) {
            return;
        }
        Object.keys(ruleActions).forEach((action, i) => {
            this.actionsList.forEach(act => {
                if (act.id === ruleActions[action].action) {
                    this.selectedActions.push(act);
                }
            });
            switch (ruleActions[action].action) {
                case 1:
                    this.addAction(this.createRedirectToExtensionNumber(), i);
                    this.sipInners.forEach((sipInner: SipInner) => {
                        if (sipInner.id.toString() === ruleActions[action].parameter) {
                            this.selectedSipInners[i] = sipInner;
                        }
                    });
                    this.actionsControls.get([`${i}`, 'parameter']).setValue(ruleActions[action].parameter);
                    this.actionsControls.get([`${i}`, 'timeout']).setValue(ruleActions[action].timeout);
                    this.actionsControls.get([`${i}`, 'timeRules']).setValue(ruleActions[action].timeRules);
                    break;
                case 2:
                    this.addAction(this.createRedirectToExternalNumber(), i);
                    this.actionsControls.get([`${i}`, 'parameter']).setValue(ruleActions[action].parameter);
                    this.actionsControls.get([`${i}`, 'timeout']).setValue(ruleActions[action].timeout);
                    this.actionsControls.get([`${i}`, 'timeRules']).setValue(ruleActions[action].timeRules);
                    break;
                case 3:
                    this.addAction(this.createRedirectToQueue(), i);
                    this.queues.forEach(queue => {
                        if (queue.id.toString() === ruleActions[action].parameter) {
                            this.selectedQueues[i] = queue;
                        }
                    });
                    this.actionsControls.get([`${i}`, 'parameter']).setValue(ruleActions[action].parameter);
                    this.actionsControls.get([`${i}`, 'timeout']).setValue(ruleActions[action].timeout);
                    this.actionsControls.get([`${i}`, 'timeRules']).setValue(ruleActions[action].timeRules);
                    break;
                case 4:
                    this.addAction(this.createCancelCall(), i);
                    break;
                case 5:
                    this.addAction(this.createPlayVoiceFile(), i);
                    this.files.forEach(file => {
                        if (file.id.toString() === ruleActions[action].parameter) {
                            this.selectedFiles[i] = file;
                        }
                    });
                    this.actionsControls.get([`${i}`, 'parameter']).setValue(ruleActions[action].parameter);
                    this.actionsControls.get([`${i}`, 'timeout']).setValue(ruleActions[action].timeout);
                    this.actionsControls.get([`${i}`, 'timeRules']).setValue(ruleActions[action].timeRules);
                    break;
                default:
                    break;
            }
        });
        this.saveFormState();
    }

    // -- data processing methods ---------------------------------------------

    private getCallRule(): void {
        this.loading ++;

        this.service.getById(this.activatedRoute.snapshot.params.id).then(response => {
            const { enabled, description, name, sip, ruleActions } = response;

            this.callRulesForm.get('description').setValue(description);
            this.callRulesForm.get('name').setValue(name);
            this.callRulesForm.get('sipId').setValue(sip.id);
            this.callRulesForm.get('enabled').setValue(enabled);
            this.saveFormState();

            this.ruleActions = ruleActions;
            this.getExtensions(sip.id);
        }).catch(() => {})
          .then(() => this.loading --);
    }

    saveCallRule(): void {
        // this.validate();
        this.saving ++;

        if (this.mode === 'create') {
            this.service.save({...this.callRulesForm.value}).then(() => {
                this.saveFormState();
                this.cancel();
            }).catch(() => {})
              .then(() => this.saving --);
        } 
        else if (this.mode === 'edit') {
            this.service.edit(this.activatedRoute.snapshot.params.id, {...this.callRulesForm.value}).then(() => {})
              .catch(() => {})
              .then(() => this.saving --);
        }
    }

    private getExtensions(id: number): void {
        this.loadingStuff ++;

        this.service.getExtensions(id).then(response => {
            this.sipInners = response.items;
            this.formatForEdit(this.ruleActions);
        }).catch(() => {})
          .then(() => this.loadingStuff --);
    }

    private getFiles(): void {
        this.loading ++;
        this.service.getFiles().then((response) => {
            this.files = response.items;
            if (this.mode === 'edit') {
                this.getCallRule();
            }
        }).catch(() => {})
          .then(() => this.loading --);
    }

    private getNumbers(): void {
        this.loading ++;
        this.service.getOuters().then(response => {
            this.numbers = response;
        }).catch(() => {})
          .then(() => this.loading --);
    }

    private getParams(): void {
        this.loading ++;
        this.service.getParams().then(response => {
            this.actionsList = response.actions;
            response.actions.map(action => {
                switch (action.id) {
                    case 1:
                        this.getNumbers();
                        break;
                    case 3:
                        this.getQueue();
                        break;
                    case 5:
                        this.getFiles();
                        break;
                }
            });
        }).catch(() => {})
          .then(() => this.loading --);
    }

    private getQueue(): void {
        this.loading ++;
        this.service.getQueue().then(response => {
            this.queues = response.items;
        }).catch(() => {})
          .then(() => this.loading --);
    }

    refreshFiles(loading: number): void {
        if (loading) return;
            
        this.storage.loading ++;
        this.service.getFiles().then((response) => {
                this.files = response.items;
                this.storage.loading --;
            }).catch(() => {})
              .then(() => this.storage.loading --);
    }

    // private validate(): void {
    //     this.callRulesForm.markAsTouched();
    //     Object.keys(this.callRulesForm.controls).forEach(control => {
    //         if (this.callRulesForm.get(`${control}`) instanceof FormArray) {
    //             const controlsArray = this.callRulesForm.get(`${control}`) as FormArray;
    //             controlsArray.markAsTouched();
    //             controlsArray.controls.forEach((cntrl: FormGroup) => {
    //                 cntrl.markAsTouched();
    //                 Object.keys(cntrl.controls).forEach(c => {
    //                     cntrl.get(`${c}`).markAsTouched();
    //                 });
    //             });
    //         } else {
    //             this.callRulesForm.get(`${control}`).markAsTouched();
    //         }
    //     });
    // }
}
