import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesServices} from '../../../services/call-rules.services';
import {Action, SipInner, SipOuter} from '../../../models/call-rules.model';
import {ActivatedRoute, Router} from '@angular/router';
import {RefsServices} from "../../../services/refs.services";

@Component({
    selector: 'pbx-call-rules-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class CallRulesCreateComponent implements OnInit {
    actionsList: Action[];
    callRulesForm: FormGroup;
    files = [];
    numbers: SipOuter[];
    mode = 'create';
    ruleActions;
    selectedActions: Action[] = [];
    selectedFiles = [];
    selectedNumber: SipOuter;
    selectedSipInners: SipInner[] = [];
    selectedQueues = [];
    sipInners: SipInner[] = [];
    queues = [];
    loading: number;
    timeRulePattern = /(\*|[0-9]*:[0-9]*-[0-9]*:[0-9]*)\|(\*|(sun|mon|tue|wed|thu|fri|sat)(&(sun|mon|tue|wed|thu|fri|sat))*)\|(\*|[0-9]*)\|(\*|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(&(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))*)/;

    constructor(private service: CallRulesServices,
                private fb: FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private refs: RefsServices) {
        activatedRoute.snapshot.params.id ? this.mode = 'edit' : this.mode = 'create';
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
            if (this.mode === 'create') {
                this.service.save({...this.callRulesForm.value}).then(() => {
                    this.router.navigate(['cabinet', 'call-rules']);
                }).catch(err => {
                    console.error(err);
                });
            } else if (this.mode === 'edit') {
                this.service.edit(this.activatedRoute.snapshot.params.id, {...this.callRulesForm.value}).then(() => {
                    this.router.navigate(['cabinet', 'call-rules']);
                }).catch(err => {
                    console.error(err);
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

    selectFile(file, i: number): void {
        this.selectedFiles[i] = file;
        this.actionsControls.get([`${i}`, `parameter`]).setValue(file.id);
    }

    selectNumber(number: SipOuter): void {
        this.selectedNumber = number;
        this.callRulesForm.get('sipId').setValue(number.id);
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
            name: [null, [Validators.required, Validators.maxLength(150), Validators.pattern('[A-Za-z0-9_-]*')]],
            description: [null, [Validators.maxLength(255)]],
            sipId: [null, [Validators.required]],
            ruleActions: this.fb.array([], Validators.required)
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
            parameter: [null, [Validators.maxLength(12), Validators.pattern('[0-9]*'), Validators.required]],
            timeout: [30, [Validators.min(5), Validators.max(300)]],
        });
    }

    private createRedirectToExtensionNumber(): FormGroup {
        return this.fb.group({
            action: 1,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.min(5), Validators.max(300)]],
            timeRules: ['', [Validators.required, Validators.pattern(this.timeRulePattern)]]
        });
    }

    private createRedirectToQueue(): FormGroup {
        return this.fb.group({
            action: 3,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.min(5), Validators.max(300)]],
        });
    }

    private createPlayVoiceFile(): FormGroup {
        return this.fb.group({
            action: 5,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.min(5), Validators.max(300)]],
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
        this.service.getEditedCallRule(this.activatedRoute.snapshot.params.id).then(res => {
            this.loading -= 1;
            const {description, name, sip, ruleActions} = res;
            this.callRulesForm.get('description').setValue(description);
            this.callRulesForm.get('name').setValue(name);
            this.callRulesForm.get('sipId').setValue(sip.id);
            this.ruleActions = ruleActions;
            this.getExtensions(sip.id);
            // console.log(ruleActions);
        }).catch(err => {
            this.loading -= 1;
            console.error(err);
        });
    }

    private getExtensions(id: number): void {
        this.loading += 1;
        this.service.getExtensions(id).then(res => {
            this.loading -= 1;
            this.sipInners = res.items;
            this.formatForEdit(this.ruleActions);
        }).catch(err => {
            this.loading -= 1;
            console.error(err);
        });
    }

    private getFiles(): void {
        this.loading += 1;
        this.service.getFiles().then((res) => {
            this.loading -= 1;
            this.files = res.items;
            this.getQueue();
            if (this.mode === 'edit') {
                this.getEditedCallRule();
            }
        }).catch(err => {
            this.loading -= 1;
            console.error(err);
        });
    }

    private getNumbers(): void {
        this.loading += 1;
        this.refs.getSipOuters().then(res => {
            this.loading -= 1;
            this.numbers = res;
        }).catch(err => {
            this.loading -= 1;
            console.error(err);
        });
    }

    private getParams(): void {
        this.loading += 1;
        this.service.getParams().then(res => {
            this.loading -= 1;
            this.actionsList = res.actions;
            this.getFiles();
        }).catch(err => {
            this.loading -= 1;
            console.error(err);
        });
    }

    private getQueue(): void {
        this.loading += 1;
        this.service.getQueue().then(res => {
            this.loading -= 1;
            this.queues = res.items;
        }).catch(err => {
            this.loading -= 1;
            console.error(err);
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

    public getTimeout(index: number): number {
        // console.log('get', this.actionsControls.get([index, 'timeout']).value);
        return this.actionsControls.get([index, 'timeout']).value;
    }

    public onTimeoutChange(index, event) {
        this.actionsControls.get([index, 'timeout']).setValue(event);

    }

    public onTimeRuleChange(index, event) {
        this.actionsControls.get([index, 'timeRules']).setValue(event);
    }

    ngOnInit() {
        this.loading = 1;
        this.buildForm();
        this.getNumbers();
        this.getParams();
        this.loading -= 1;
    }
}
