import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesServices} from '../../../services/call-rules.services';
import {Action, SipInner, SipOuter} from '../../../models/call-rules.model';

@Component({
  selector: 'pbx-call-rules-create',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class CallRulesCreateComponent implements OnInit {
  actionsList: Action[];
  callRulesForm: FormGroup;
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
    [
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
      {time: '12 a.m', timeAster: '12:00'}
    ],
    [
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
    ]
  ];
  numbers: SipOuter[];
  ruleTime = [
    {id: 1, code: 'Always (24 hours)'},
    {id: 2, code: 'Date (period)'},
    {id: 3, code: 'Days of the week'},
  ];
  ruleTimeAsterisk = [];
  selectedActions: Action[] = [];
  selectedDurationTime = [];
  selectedDuration = [];
  selectedNumber: SipOuter;
  selectedRuleTime = [];
  selectedSipInners: SipInner[] = [];
  selectedQueues = [];
  sipInners: SipInner[];
  queues;

  constructor(private service: CallRulesServices,
              private fb: FormBuilder) {
  }

  deleteAction(i: number): void {
    this.selectedActions.splice(i + 1, 1);
    this.actionsControls.removeAt(i + 1);
  }

  cancel(): void {
    this.callRulesForm.reset();
  }

  save(): void {
    this.formatAsterRule();
    console.log(this.callRulesForm);
    console.log(this.ruleTimeAsterisk);
    // this.service.save({...this.callRulesForm.value}).then(res => {
    // }).catch(err => {
    //   console.error(err);
    // });
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
    console.log(this.callRulesForm);
    console.log(this.selectedActions);
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
      this.ruleTimeAsterisk[i].time = '*';
    }
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
        month: ''
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

  selectTime(time, i: number): void {
    this.selectedDuration[i] = time;
    if (this.selectedDuration[0] && this.selectedDuration[1]) {
      this.ruleTimeAsterisk[i].time = `${this.selectedDuration[0].timeAster}-${this.selectedDuration[1].timeAster}`;
      console.log(this.ruleTimeAsterisk[i].time);
    }
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
      name: null,
      description: null,
      sipId: null,
      ruleActions: this.fb.array([])
    });
  }

  private createCancelCall(): FormGroup {
    return this.fb.group({
      action: 4,
      timeout: 30,
    });
  }

  private createRedirectToExternalNumber(): FormGroup {
    return this.fb.group({
      action: 2,
      parameter: null,
      timeout: 30,
    });
  }

  private createRedirectToExtensionNumber(): FormGroup {
    return this.fb.group({
      action: 1,
      parameter: null,
      timeout: 30,
    });
  }

  private createRedirectToQueue(): FormGroup {
    return this.fb.group({
      action: 3,
      parameter: null,
      timeout: 30,
    });
  }

  private createPlayVoiceFile(): FormGroup {
    return this.fb.group({
      action: 5,
      parameter: null,
      timeout: 30,
      timeRules: ''
    });
  }

  private formatAsterRule() {
    this.ruleTimeAsterisk.forEach((el, i) => {
      console.log(el, i);
      this.actionsControls.get([`${i}`, 'timeRules']).setValue(`${el.time}|${el.days}|${el.date}|${el.month}`);
    });
  }

  private getExtensions(id: number): void {
    this.service.getExtensions(id).then(res => {
      this.sipInners = res.items;
    }).catch(err => {
      console.error(err);
    });
  }

  private getFiles(): void {
    this.service.getFiles().then(() => {
    }).catch(err => {
      console.error(err);
    });
  }

  private getNumbers(): void {
    this.service.getNumbers().then(res => {
      this.numbers = res.items;
    }).catch(err => {
      console.error(err);
    });
  }

  private getParams(): void {
    this.service.getParams().then(res => {
      this.actionsList = res.actions;
    }).catch(err => {
      console.error(err);
    });
  }

  private getQueue(): void {
    this.service.getQueue().then(res => {
      this.queues = res.items;
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit() {
    this.buildForm();
    this.getNumbers();
    this.getParams();
    this.getFiles();
    this.getQueue();
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
