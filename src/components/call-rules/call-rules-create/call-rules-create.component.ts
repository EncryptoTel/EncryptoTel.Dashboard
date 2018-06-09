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
  days = [
    {type: 'cancel', day: 'Mon', code: 'mon'},
    {type: 'cancel', day: 'Tue', code: 'tue'},
    {type: 'cancel', day: 'Wed', code: 'wed'},
    {type: 'cancel', day: 'Thu', code: 'thu'},
    {type: 'cancel', day: 'Fri', code: 'fri'},
    {type: 'cancel', day: 'Sat', code: 'sat'},
    {type: 'cancel', day: 'Sun', code: 'sun'}
  ];
  duration = [
    {id: 1, code: 'Always (24 hours)'},
    {id: 2, code: 'Set the time'}
  ];
  numbers: SipOuter[];
  ruleTime = [
    {id: 1, code: 'Always (24 hours)'},
    {id: 2, code: 'Date (period)'},
    {id: 3, code: 'Days of the week'},
  ];
  ruleTimeAsterisk = {
    time: '',
    days: '',
    date: '',
    month: ''
  };
  selectedActions: Action[] = [];
  selectedDurationTime = [];
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
    console.log(this.callRulesForm);
    this.service.save({...this.callRulesForm.value}).then(res => {
    }).catch(err => {
      console.error(err);
    });
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

  selectDay(i: number): void {
    if (this.days[i].type === 'accent') {
      const startIndex = this.ruleTimeAsterisk.days.indexOf(this.days[i].code);
      this.ruleTimeAsterisk.days = this.ruleTimeAsterisk.days.slice(startIndex, 5);
      console.log(startIndex);
    } else {
      if (this.ruleTimeAsterisk.days) {
        this.ruleTimeAsterisk.days = `${this.ruleTimeAsterisk.days}&${this.days[i].code}`;
      } else {
        this.ruleTimeAsterisk.days = `${this.ruleTimeAsterisk.days}|${this.days[i].code}`;
      }
    }
    this.days[i].type === 'accent' ? this.days[i].type = 'cancel' : this.days[i].type = 'accent';
    console.log(this.ruleTimeAsterisk.days);
  }

  selectDurationTime(i: number, duration): void {
    this.selectedDurationTime[i] = duration;
    this.actionsControls.get([`${i}`, `parameter`]).setValue(duration.id);
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
    this.selectedRuleTime[i] = rule;
    this.actionsControls.get([`${i}`, `parameter`]).setValue(rule.id);
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
