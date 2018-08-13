import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesService} from '../../../services/call-rules.service';
import {Action, SipInner, SipItem} from '../../../models/call-rules.model';
import {ActivatedRoute, Router} from '@angular/router';
import {RefsServices} from "../../../services/refs.services";
import {StorageService} from "../../../services/storage.service";
import {StorageModel} from "../../../models/storage.model";
import {MessageServices} from "../../../services/message.services";
import {MediaPlayerComponent} from '../../../elements/pbx-media-player/pbx-media-player.component';
import {CdrMediaInfo, MediaState} from '../../../models/cdr.model';
import {redirectToExtensionValidator} from '../../../shared/encry-form-validators';

@Component({
    selector: 'pbx-call-rules-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')],
    providers: [StorageService]
})

export class CallRulesCreateComponent implements OnInit {

    saving: number = 0;
    actionsList: Action[];
    callRulesForm: FormGroup;
    files = [];
    numbers: SipItem[];
    mode = 'create';
    ruleActions;
    selectedActions: Action[] = [];
    selectedFiles = [];
    selectedNumber: SipItem;
    selectedSipInners: SipInner[] = [];
    selectedQueues = [];
    sipInners: SipInner[] = [];
    queues = [];
    loading: number = 0;
    loadingStuff: number = 0;
    timeRulePattern = /(\*|[0-9]*:[0-9]*-[0-9]*:[0-9]*)\|(\*|(sun|mon|tue|wed|thu|fri|sat)(&(sun|mon|tue|wed|thu|fri|sat))*)\|(\*|[0-9]*)\|(\*|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(&(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))*)/;
    currentMediaStream: string;
    playButtonText: string;

    @ViewChild('mediaPlayer') mediaPlayer: MediaPlayerComponent;


    constructor(private service: CallRulesService,
                private fb: FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private refs: RefsServices,
                private storage: StorageService,
                private message: MessageServices) {
        activatedRoute.snapshot.params.id ? this.mode = 'edit' : this.mode = 'create';
        this.playButtonText = 'Play';
    }

    deleteAction(i: number): void {
        this.selectedActions.splice(i + 1, 1);
        this.actionsControls.removeAt(i + 1);
        // this.ruleTimeAsterisk.splice(i + 1, 1);
    }

    cancel(): void {
        this.router.navigate(['cabinet', 'call-rules']);
    }

    save(): void {
        this.validate();
        if (this.callRulesForm.valid) {
            this.saving ++;
            if (this.mode === 'create') {
                this.service.save({...this.callRulesForm.value}).then(() => {
                    this.saving --;
                    this.cancel();
                }).catch(err => {
                    this.saving --;
                });
            } else if (this.mode === 'edit') {
                this.service.edit(this.activatedRoute.snapshot.params.id, {...this.callRulesForm.value}).then(() => {
                    this.saving --;
                    // this.cancel();
                }).catch(err => {
                    this.saving --;
                });
            }
        }
    }

    selectAction(action: Action, i: number = 0): void {
        this.selectedActions[i] = action;
        switch (action.id) {
            case 1:
                this.addAction(this.createRedirectToExtensionNumber(), i);
                break;
            case 2:
                this.addAction(this.createRedirectToExternalNumber(), i);
                break;
            case 3:
                this.addAction(this.createRedirectToQueue(), i);
                break;
            case 4:
                this.addAction(this.createCancelCall(), i);
                break;
            case 5:
                this.addAction(this.createPlayVoiceFile(), i);
                break;
            default:
                break;
        }
    }

    selectFile(i: number, file: any): void {
        if (this.mediaPlayer.selectedMediaId != file.id && this.mediaPlayer.state == MediaState.Playing) {
            this.stopPlayerPlay();
        }
        this.selectedFiles[i] = file;
        this.actionsControls.get([`${i}`, `parameter`]).setValue(file.id);
    }

    selectNumber(number: SipItem): void {
        this.selectedNumber = number;
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

    get actionsControls(): FormArray {
        return this.callRulesForm.get('ruleActions') as FormArray;
    }

    private addAction(actionGroup: FormGroup, i: number): void {
        this.actionsControls.setControl(i, actionGroup);
    }

    private buildForm(): void {
        this.callRulesForm = this.fb.group({
            enabled: [null, []],
            name: [null, [Validators.required, Validators.maxLength(150)]],
            description: [null, [Validators.maxLength(255)]],
            sipId: [null, [Validators.required]],
            ruleActions: this.fb.array([], Validators.required)
        }, {
            validator: (formGroup: FormGroup) => {
                return redirectToExtensionValidator(formGroup);
            }
        });
    }

    private createCancelCall(): FormGroup {
        return this.fb.group({
            action: 4,
            timeout: [30, [Validators.min(5), Validators.max(300)]],
        });
    }

    private createRedirectToExternalNumber(): FormGroup {
        return this.fb.group({
            action: 2,
            parameter: [null, [Validators.minLength(6), Validators.maxLength(16), Validators.pattern('[0-9]*'), Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules: ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    private createRedirectToExtensionNumber(): FormGroup {
        return this.fb.group({
            action: 1,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules: ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    private createRedirectToQueue(): FormGroup {
        return this.fb.group({
            action: 3,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules: ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    private createPlayVoiceFile(): FormGroup {
        return this.fb.group({
            action: 5,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.pattern('[0-9]*'), Validators.min(5), Validators.max(300)]],
            timeRules: ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
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
    }

    private getEditedCallRule(): void {
        this.loading += 1;
        this.service.getById(this.activatedRoute.snapshot.params.id).then(res => {
            this.loading -= 1;
            const {enabled, description, name, sip, ruleActions} = res;
            this.callRulesForm.get('description').setValue(description);
            this.callRulesForm.get('name').setValue(name);
            this.callRulesForm.get('sipId').setValue(sip.id);
            this.callRulesForm.get('enabled').setValue(enabled);
            this.ruleActions = ruleActions;
            this.getExtensions(sip.id);
        }).catch(err => {
            this.loading -= 1;
        });
    }

    private getExtensions(id: number): void {
        this.loadingStuff += 1;
        this.service.getExtensions(id).then(res => {
            this.loadingStuff -= 1;
            this.sipInners = res.items;
            this.formatForEdit(this.ruleActions);
        }).catch(err => {
            this.loadingStuff -= 1;
        });
    }

    private getFiles(): void {
        this.loading += 1;
        this.service.getFiles().then((res) => {
            this.loading -= 1;
            this.files = res.items;
            if (this.mode === 'edit') {
                this.getEditedCallRule();
            }
        }).catch(err => {
            this.loading -= 1;
        });
    }

    private getNumbers(): void {
        this.loading += 1;
        this.service.getOuters().then(res => {
            this.loading -= 1;
            this.numbers = res;
        }).catch(err => {
            this.loading -= 1;
        });
    }

    private getParams(): void {
        this.loading += 1;
        this.service.getParams().then(res => {
            this.loading -= 1;
            this.actionsList = res.actions;

            res.actions.map(action => {
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
        }).catch(err => {
            this.loading -= 1;
        });
    }

    private getQueue(): void {
        this.loading += 1;
        this.service.getQueue().then(res => {
            this.loading -= 1;
            this.queues = res.items;
        }).catch(err => {
            this.loading -= 1;
        });
    }

    private validate(): void {
        this.callRulesForm.markAsTouched();
        Object.keys(this.callRulesForm.controls).forEach(control => {
            if (this.callRulesForm.get(`${control}`) instanceof FormArray) {
                const controlsArray = this.callRulesForm.get(`${control}`) as FormArray;
                controlsArray.markAsTouched();
                controlsArray.controls.forEach((cntrl: FormGroup) => {
                    cntrl.markAsTouched();
                    Object.keys(cntrl.controls).forEach(c => {
                        cntrl.get(`${c}`).markAsTouched();
                    });
                });
            } else {
                this.callRulesForm.get(`${control}`).markAsTouched();
            }
        });
    }

    public onTimeRuleChange(index, event) {
        this.actionsControls.get([index, 'timeRules']).setValue(event);
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

    getActionFormKey(index: number, last: boolean = false) {
        let control = this.actionsControls.get([index, 'parameter']);
        let key = !control && !last ? 'ruleActions' : '';
        return key;
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

    refreshFiles(loading: number): void {
        if (!loading) {
            this.storage.loading ++;
            this.service.getFiles()
                .then((result) => {
                    this.files = result.items;
                    this.storage.loading --;
                }).catch(error => {
                    this.storage.loading --;
                });
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

    ngOnInit() {
        this.loading++;
        this.buildForm();
        this.getParams();
        this.loading--;
    }
}
