import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesService} from '../../../services/call-rules.service';
import {Action, SipInner, SipItem, CallRulesItem} from '../../../models/call-rules.model';
import {StorageService} from '../../../services/storage.service';
import {MessageServices} from '../../../services/message.services';
import {MediaPlayerComponent} from '../../../elements/pbx-media-player/pbx-media-player.component';
import {CdrMediaInfo, MediaState} from '../../../models/cdr.model';
import {redirectToExtensionValidator, numberRangeValidator, callRuleTimeValidator, durationTimeValidator} from '../../../shared/encry-form-validators';
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
    currentMediaStream: string = '/assets/mp3/silence.mp3';
    files = [];
    mode = 'create';
    numbers: SipItem[];
    queues = [];
    groups = [];
    playButtonText: string;
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
                protected message: MessageServices
    ) {
        super(fb, message);

        this.callRule = new CallRulesItem();
        this.callRule.id = activatedRoute.snapshot.params.id;

        this.mode = this.callRule.id ? 'edit' : 'create';
        this.playButtonText = 'Play';

        this.validationHost.customMessages = [
            {name: 'Rule Name', error: 'pattern', message: 'Rule Name may contain letters, digits, dashes and underscores only'},
            {name: 'Action', error: 'required', message: 'Please choose an action'},
            {name: 'If I do not answer call within', error: 'range', message: 'Please enter value between 5 and 300'},
            {name: 'Action applies for', error: 'days', message: 'Please select days of the week'},
            {name: 'Duration time', error: 'startTime', message: 'Start time cannot be greater than end time'},
            {name: 'Duration time', error: 'equalTime', message: 'Start time cannot be the same as end time'},
            {name: 'Duration time', error: 'invalidRange', message: 'Invalid time range format'},
            {name: 'Extension number', error: 'duplicated', message: 'You cannot use two identical extensions followed one by one'},
        ];
    }

    ngOnInit() {
        this.loading++;

        super.ngOnInit();
        super.setFormData(this.callRule);
        this.getParams();

        this.loading--;
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
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules: ['', []],
            callRuleTime: ['', [callRuleTimeValidator]],
            durationTime: ['', [durationTimeValidator]],
        });
    }

    private createRedirectToExtensionNumber(): FormGroup {
        return this.fb.group({
            action: 1,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), numberRangeValidator(5, 300)]],
            timeRules: ['', []],
            callRuleTime: ['', [callRuleTimeValidator]],
            durationTime: ['', [durationTimeValidator]],
        });
    }

    private createRedirectToQueue(): FormGroup {
        return this.fb.group({
            action: 3,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules: ['', []],
            callRuleTime: ['', [callRuleTimeValidator]],
            durationTime: ['', [durationTimeValidator]],
        });
    }

    private createRedirectToGroup(): FormGroup {
        return this.fb.group({
            action: 3,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules: ['', []],
            callRuleTime: ['', [callRuleTimeValidator]],
            durationTime: ['', [durationTimeValidator]],
        });
    }

    private createCancelCall(): FormGroup {
        return this.fb.group({
            action: 4,
            parameter: [null],
            timeout: [30, [Validators.min(5), Validators.max(300)]],
        });
    }

    private createPlayVoiceFile(): FormGroup {
        return this.fb.group({
            action: 5,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
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

    updateTimeRulesFormData(action: any, index: number): void {
        const timeRules = action.timeRules.split('|');
        this.actionsControls.get([index, 'callRuleTime']).setValue(timeRules[1]);
        this.actionsControls.get([index, 'durationTime']).setValue(timeRules[0]);
    }

    // -- event handlers ------------------------------------------------------

    selectAction(action: Action, index: number = 0): void {
        this.selectedActions[index] = action;
        this.addAction(this.actionFactory(action.id), index);
        this.resetParameterControlState(index);
    }

    checkNextAction(index: number) {
        const valid = [1, 5].includes(this.selectedActions[index].id);
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
    }

    selectNumber(number: SipItem): void {
        this.selectedNumber = number;
        this.form.get('sipId').setValue(number.id);

        this.getExtensions(number.id);
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
        if (this.mediaPlayer.selectedMediaId !== file.id && this.mediaPlayer.state === MediaState.PLAYING) {
            this.stopPlayerPlay();
        }
        this.selectedFiles[index] = file;
        this.setParameterControlValue(index, file.id);
    }

    isFileSelected(index: number): boolean {
        return !!this.selectedFiles[index];
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
        control.markAsUntouched();
    }

    onTimeRuleChange(index, event) {
        // let _time: any;
        // let _days: any;
        // let days: any;
        // days = {};
        // let startTime: any;
        // let endTime: any;
        //
        // _time = event.split('|');
        // if (_time[0] !== '*') {
        //     _days = _time[1];
        //     _time = _time[0].split('-');
        //
        //     startTime = _time[0];
        //     startTime = startTime.split(':');
        //     startTime = startTime[0];
        //
        //     endTime = _time[1];
        //     endTime = endTime.split(':');
        //     endTime = endTime[0];
        //
        //     console.log('time ', parseInt(startTime), parseInt(endTime));
        //     if (parseInt(startTime) >= 12 && (parseInt(endTime) >= 0 && parseInt(endTime) <= 12)) {
        //         if (_days !== '*') {
        //             let daysArrayMap: any;
        //             daysArrayMap = {};
        //             daysArrayMap['mon'] = 'tue';
        //             daysArrayMap['tue'] = 'wed';
        //             daysArrayMap['wed'] = 'thu';
        //             daysArrayMap['thu'] = 'fri';
        //             daysArrayMap['fri'] = 'sat';
        //             daysArrayMap['sat'] = 'san';
        //             daysArrayMap['san'] = 'mon';
        //             _days = _days.split('&');
        //             let idx: number;
        //             for (idx in _days) {
        //                 days[_days[idx]] = _days[idx];
        //             }
        //
        //             for (idx in days) {
        //                 days[daysArrayMap[idx]] = daysArrayMap[idx];
        //             }
        //             days = Object.keys(days).map(function (key) { return days[key]; });
        //             console.log(days.join('&'));
        //         }
        //     }
        // }

        this.actionsControls.get([index, 'timeRules']).setValue(event);
    }

    save(): void {
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
                        if (!this.storage.loading) {
                            this.refreshFiles(loading);
                        }
                    });
            }
            else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
            this.storage.checkModal();
        }
    }

    togglePlay(i: number): void {
        const fileId = this.actionsControls.get([`${i}`, `parameter`]).value;
        if (fileId) {
            this.mediaPlayer.togglePlay(fileId);
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
                // Error handling here ...
            })
            .then(() => this.mediaPlayer.locker.unlock());
    }

    mediaStateChanged(state: MediaState): void {
        switch (state) {
            case MediaState.LOADING:
                this.playButtonText = 'Loading';
                break;
            case MediaState.PLAYING:
                this.playButtonText = 'Pause';
                break;
            case MediaState.PAUSED:
            default:
                this.playButtonText = 'Play';
                break;
        }
    }

    // -- data processing methods ---------------------------------------------

    private getCallRule(): void {
        this.loading++;

        this.service.getById(this.callRule.id).then(response => {
            this.setFormData(response);
        }).catch(() => {
        })
            .then(() => this.loading--);
    }

    setFormData(data: any): void {
        const {id, enabled, description, name, sip, ruleActions} = data;

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
            this.service.save({...this.callRulesForm.value}).then(() => {
                this.saveFormState();
                this.cancel();
            }).catch(() => {
            })
                .then(() => this.saving--);
        }
        else if (this.mode === 'edit') {
            this.service.edit(this.activatedRoute.snapshot.params.id, {...this.callRulesForm.value}).then(() => {
                this.saveFormState();
            }).catch(() => {
                let tmp: any;
                tmp = '';
            })
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
        })
            .then(() => this.loadingStuff--);
    }

    private getParams(): void {
        // TODO: use Promise.all here
        this.loading++;
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
                    case 6:
                        this.getGroup();
                        break;
                    case 5:
                        this.getFiles();
                        break;
                }
            });
        }).catch(() => {
        })
            .then(() => this.loading--);
    }

    private getFiles(): void {
        this.loading++;
        this.service.getFiles().then((response) => {
            this.files = response.items;
            if (this.mode === 'edit') {
                this.getCallRule();
            }
        }).catch(() => {
        })
            .then(() => this.loading--);
    }

    private getNumbers(): void {
        this.loading++;
        this.service.getOuters().then(response => {
            response.forEach(item => {
               if (item.providerId !== 1) {
                   item.phoneNumber = '+' + item.phoneNumber;
               }
            });
            this.numbers = response;
        }).catch(() => {
        })
            .then(() => this.loading--);
    }

    private getQueue(): void {
        this.loading++;
        this.service.getQueue().then(response => {
            this.queues = response.items;
        }).catch(() => {
        })
            .then(() => this.loading--);
    }

    private getGroup(): void {
        this.loading++;
        this.service.getGroup().then(response => {
            this.groups = response.items;
        }).catch(() => {
        })
            .then(() => this.loading--);
    }

    refreshFiles(loading: number): void {
        if (loading) return;

        this.storage.loading++;
        this.service.getFiles().then((response) => {
            this.files = response.items;
        }).catch(() => {
        })
            .then(() => this.storage.loading--);
    }
}
