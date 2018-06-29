import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesServices} from '../../../services/call-rules.services';
import {Action, SipInner, SipOuter} from '../../../models/call-rules.model';
import {ActivatedRoute, Router} from '@angular/router';

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
    days = [[
        {type: 'cancel', day: 'Mon', code: 'mon'},
        {type: 'cancel', day: 'Tue', code: 'tue'},
        {type: 'cancel', day: 'Wed', code: 'wed'},
        {type: 'cancel', day: 'Thu', code: 'thu'},
        {type: 'cancel', day: 'Fri', code: 'fri'},
        {type: 'cancel', day: 'Sat', code: 'sat'},
        {type: 'cancel', day: 'Sun', code: 'sun'}
    ]];
    duration = [
        {id: 1, code: 'Always (24 hours)'},
        {id: 2, code: 'Set the time'}
    ];
    durationTime = [
        {time: '1 a.m', timeAster: '1:00'},
        {time: '2 a.m', timeAster: '2:00'},
        {time: '3 a.m', timeAster: '3:00'},
        {time: '4 a.m', timeAster: '4:00'},
        {time: '5 a.m', timeAster: '5:00'},
        {time: '6 a.m', timeAster: '6:00'},
        {time: '7 a.m', timeAster: '7:00'},
        {time: '8 a.m', timeAster: '8:00'},
        {time: '9 a.m', timeAster: '9:00'},
        {time: '10 a.m', timeAster: '10:00'},
        {time: '11 a.m', timeAster: '11:00'},
        {time: '12 a.m', timeAster: '12:00'},
        {time: '1 p.m', timeAster: '13:00'},
        {time: '2 p.m', timeAster: '14:00'},
        {time: '3 p.m', timeAster: '15:00'},
        {time: '4 p.m', timeAster: '16:00'},
        {time: '5 p.m', timeAster: '17:00'},
        {time: '6 p.m', timeAster: '18:00'},
        {time: '7 p.m', timeAster: '19:00'},
        {time: '8 p.m', timeAster: '20:00'},
        {time: '9 p.m', timeAster: '21:00'},
        {time: '10 p.m', timeAster: '22:00'},
        {time: '11 p.m', timeAster: '23:00'},
        {time: '12 p.m', timeAster: '24:00'}
    ];
    numbers: SipOuter[];
    mode = 'create';
    ruleActions;
    ruleTime = [
        {id: 1, code: 'Always (24 hours)'},
        {id: 2, code: 'Date (period)'},
        {id: 3, code: 'Days of the week'},
    ];
    ruleTimeAsterisk = [];
    selectedActions: Action[] = [];
    selectedDurationTime = [];
    selectedDuration = [[]];
    selectedFiles = [];
    selectedNumber: SipOuter;
    selectedRuleTime = [];
    selectedSipInners: SipInner[] = [];
    selectedQueues = [];
    sipInners: SipInner[] = [];
    queues = [];
    loading: number;

    constructor(private service: CallRulesServices,
                private fb: FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
        activatedRoute.snapshot.params.id ? this.mode = 'edit' : this.mode = 'create';
    }

    deleteAction(i: number): void {
        this.selectedActions.splice(i + 1, 1);
        this.actionsControls.removeAt(i + 1);
        this.ruleTimeAsterisk.splice(i + 1, 1);
    }

    cancel(): void {
        this.router.navigate(['cabinet', 'call-rules']);
    }

    save(): void {
        this.formatAsterRule();
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

    selectDay(idx: number, i: number): void {
        if (this.days[i][idx].type === 'accent') {
            const index = this.ruleTimeAsterisk[i].days.findIndex(day => {
                if (day.code === this.days[i][idx].code) {
                    return true;
                }
            });
            this.ruleTimeAsterisk[i].days.splice(index, 1);
        } else {
            this.ruleTimeAsterisk[i].days.push(this.days[i][idx].code);
        }
        this.days[i][idx].type === 'accent' ? this.days[i][idx].type = 'cancel' : this.days[i][idx].type = 'accent';
    }

    selectDurationTime(i: number, duration): void {
        this.selectedDurationTime[i] = duration;
        this.actionsControls.get([`${i}`, `parameter`]).setValue(duration.id);
        if (duration.id === 1) {
            if (!this.ruleTimeAsterisk[i]) {
                this.ruleTimeAsterisk[i] = {
                    days: [],
                    date: '',
                    month: '',
                    time: ''
                };
            }
            this.ruleTimeAsterisk[i].time = '*';
        } else if (duration.id === 2) {
            this.selectedDuration[i] = [[], []];
            if (!this.ruleTimeAsterisk[i]) {
                this.ruleTimeAsterisk[i] = {
                    days: [],
                    date: '',
                    month: '',
                    time: ''
                };
            }
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

    selectRuleTime(i: number, rule): void {
        if (!this.ruleTimeAsterisk[i]) {
            this.ruleTimeAsterisk[i] = {
                days: [],
                date: '',
                month: '',
                time: ''
            };
        }
        this.selectedRuleTime[i] = rule;
        this.actionsControls.get([`${i}`, `parameter`]).setValue(rule.id);
        switch (rule.id) {
            case 1:
                this.days[i] = [];
                this.ruleTimeAsterisk[i].days = ['*'];
                this.ruleTimeAsterisk[i].date = '*';
                this.ruleTimeAsterisk[i].month = '*';
                break;
            case 2:
                this.days[i] = [];
                this.ruleTimeAsterisk[i].days = ['*'];
                this.ruleTimeAsterisk[i].date = '';
                this.ruleTimeAsterisk[i].month = '';
                break;
            case 3:
                this.days[i] = [
                    {type: 'cancel', day: 'Mon', code: 'mon'},
                    {type: 'cancel', day: 'Tue', code: 'tue'},
                    {type: 'cancel', day: 'Wed', code: 'wed'},
                    {type: 'cancel', day: 'Thu', code: 'thu'},
                    {type: 'cancel', day: 'Fri', code: 'fri'},
                    {type: 'cancel', day: 'Sat', code: 'sat'},
                    {type: 'cancel', day: 'Sun', code: 'sun'}
                ];
                this.ruleTimeAsterisk[i].days = [];
                this.ruleTimeAsterisk[i].date = '*';
                this.ruleTimeAsterisk[i].month = '*';
                break;
            default:
                this.days[i] = [];
                this.ruleTimeAsterisk[i].days = [];
                this.ruleTimeAsterisk[i].date = '';
                this.ruleTimeAsterisk[i].month = '';
                break;
        }
    }

    selectTime(time, i: number, idx): void {
        this.selectedDuration[i][idx] = time;
        this.ruleTimeAsterisk[i].time = `${this.selectedDuration[i][idx].timeAster}-${this.selectedDuration[i][idx].timeAster}`;
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
        const timeRulePattern = /(\*|[0-9]*:[0-9]*-[0-9]*:[0-9]*)\|(\*|(sun|mon|tue|wed|thu|fri|sat)(&(sun|mon|tue|wed|thu|fri|sat))*)\|(\*|[0-9]*)\|(\*|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(&(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))*)/;
        return this.fb.group({
            action: 5,
            parameter: [null, [Validators.required]],
            timeout: [30, [Validators.min(5), Validators.max(300)]],
            timeRules: ['', [Validators.required, Validators.pattern(timeRulePattern)]]
        });
    }

    private formatAsterRule(): void {
        let days;
        this.ruleTimeAsterisk.forEach((el, i) => {
            el.days.forEach((day, index) => {
                if (index === 0) {
                    days = day;
                } else {
                    days = days + '&' + day;
                }
            });
            this.actionsControls.get([`${i}`, 'timeRules']).setValue(`${el.time}|${days}|${el.date}|${el.month}`);
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
                    break;
                case 2:
                    this.addAction(this.createRedirectToExternalNumber(), i);
                    this.actionsControls.get([`${i}`, 'parameter']).setValue(ruleActions[action].parameter);
                    this.actionsControls.get([`${i}`, 'timeout']).setValue(ruleActions[action].timeout);
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
                    const timePattern = /(\*|[0-9]*:[0-9]*-[0-9]*:[0-9]*)/;
                    const daysPattern = /(\*|(sun|mon|tue|wed|thu|fri|sat)(&(sun|mon|tue|wed|thu|fri|sat))*)/;
                    const monthPattern = /(\*|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(&(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))*)/;
                    const time = timePattern.exec(ruleActions[action].timeRules);
                    const days = daysPattern.exec(ruleActions[action].timeRules);
                    const month = monthPattern.exec(ruleActions[action].timeRules);
                    console.log(time);
                    console.log(days);
                    console.log(month);
                    console.log(time[0]);
                    console.log(this.duration[0]);
                    if (time[0] === '*') {
                        this.selectDurationTime(i, this.duration[0]);
                    } else {
                        this.selectDurationTime(i, this.duration[1]);
                    }
                    console.log(this.selectedDurationTime[i]);
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
        this.service.getNumbers().then(res => {
            this.loading -= 1;
            this.numbers = res.items;
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

    ngOnInit() {
        this.loading = 1;
        this.buildForm();
        this.getNumbers();
        this.getParams();
        this.loading -= 1;
    }
}

//   Паттерн строки:
//   Временной интервал|Дни недели|Дни месяца|Месяцы
//
// Временной интервал:
//   Пример: 9:00-17:00
//
// Дни недели:
//   Возможные значения: sun mon tue wed thu fri sat
// Пример: mon-fri
//
// Дни месяца:
//   Возможные значения: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
// Пример: 1-10
//
// Месяцы:
//   Возможные значения: jan feb mar apr may jun jul aug sep oct nov dec
// Пример: feb или jul&sep
//
// * - весь интервал
// & - И
