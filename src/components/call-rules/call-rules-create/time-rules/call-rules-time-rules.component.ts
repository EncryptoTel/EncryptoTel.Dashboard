import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';

import {AsteriskTimeRule, CallRuleTimeType, CallRuleTime, CallRuleDay} from '../../../../models/call-rules.model';
import {ValidationHost} from '../../../../models/validation-host.model';
import {CallRulesService} from '../../../../services/call-rules.service';
import {callRuleTimeValidator, durationTimeValidator} from '../../../../shared/encry-form-validators';


@Component({
    selector: 'call-rules-time-rules',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})
export class CallRulesTimeRulesComponent implements OnInit {
    
    @Input() action: any;
    @Input() form: FormGroup;
    @Input() validationHost: ValidationHost;
    
    @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

    asteriskTimeRule: AsteriskTimeRule;
    callRuleTimeDays: CallRuleDay[];
    selectedCallRuleTimeType: CallRuleTimeType;
    selectedDurationTimeType: CallRuleTimeType;
    selectedDurationTimeRange: CallRuleTime[];

    errors/* = { ruleTime: '', durationTime: '' }*/;

    // -- properties ----------------------------------------------------------

    get callRuleTimeTypes(): CallRuleTimeType[] {
        return this.service.callRuleTimeTypes;
    }

    get durationTimeTypes(): CallRuleTimeType[] {
        return this.service.durationTimeTypes;
    }

    get callRuleTimes(): CallRuleTime[] {
        return this.service.callRuleTimes;
    }

    get callRuleDays(): CallRuleDay[] {
        return this.service.callRuleDays;
    }

    get isCallRuleDaysSelected(): boolean {
        return this.selectedCallRuleTimeType && this.selectedCallRuleTimeType.id === 3;
    }

    get isDurationTimeRangeSelected(): boolean {
        return this.selectedDurationTimeType && this.selectedDurationTimeType.id === 2;
    }

    // -- component lifecycle methods -----------------------------------------

    constructor(private service: CallRulesService,
                private fb: FormBuilder) {
        this.asteriskTimeRule = new AsteriskTimeRule();
    }
    
    ngOnInit() {
        this.initFormControl();

        const timeRules = this.action.get('timeRules') ? this.action.get('timeRules').value : null;
        const rules = timeRules ? timeRules.split('|') : null;

        if (!rules || rules[0] === '*') {
            this.selectDurationTime(this.durationTimeTypes[0]);
        } else {
            this.selectDurationTime(this.durationTimeTypes[1]);
            const times = rules[0].split('-');
            this.selectTime(this.callRuleTimes.find(item => item.asteriskTime === times[0]), 0);
            this.selectTime(this.callRuleTimes.find(item => item.asteriskTime === times[1]), 1);
        }
        if (!rules || rules[1] === '*') {
            this.selectTimeRule(this.callRuleTimeTypes[0]);
        } else {
            this.selectTimeRule(this.callRuleTimeTypes[1]);
            const weekDays = rules[1].split('&');
            weekDays.forEach(day => {
                this.selectDay(this.callRuleTimeDays.indexOf(this.callRuleTimeDays.find(item => item.code === day)));
            });
        }

    }

    initFormControl(): void {
        this.form.setControl(
            'timeRulesGroup', 
            this.fb.group({
                appliesForTime: this.fb.group({
                    timeType:   [null],
                    daysOfWeek: [[]],
                }, { validator: callRuleTimeValidator }),
                durationTime:   this.fb.group({
                    timeType:   [null],
                    timeStart:  [null],
                    timeEnd:    [null],
                }, { validator: durationTimeValidator }),
            }));
        this.validationHost.initItems();
    }

    get appliesForTimeCtrl(): FormGroup {
        return <FormGroup>this.form.get('timeRulesGroup.appliesForTime');
    }

    get durationTimeCtrl(): FormGroup {
        return <FormGroup>this.form.get('timeRulesGroup.durationTime');
    }

    setTimeTypeFormValue(groupCtrl: FormGroup, value: any): void {
        groupCtrl.get('timeType').setValue(value);
    }

    setCallRuleTimeDaysFormValue(): void {
        this.appliesForTimeCtrl.get('daysOfWeek').setValue(this.callRuleTimeDays.filter(d => d.type === 'accent'));
    }

    setDurationTimeFormValue(formKey: string, value: string): void {
        this.durationTimeCtrl.get(formKey).setValue(value);
    }

    setDurationTimeRangeFormValue(idx: number, time: CallRuleTime): void {
        const formKey = idx ? 'timeEnd' : 'timeStart';
        const value = time ? time.asteriskTime : null;

        this.durationTimeCtrl.get(formKey).setValue(value);
    }

    // -- event handlers ------------------------------------------------------

    selectTimeRule(rule): void {
        this.selectedCallRuleTimeType = rule;
        this.setTimeTypeFormValue(this.appliesForTimeCtrl, rule.id);

        switch (rule.id) {
            case 1:
                this.callRuleTimeDays = [];
                this.asteriskTimeRule.initForAlwaysRule();
                break;
            case 2:
                this.callRuleTimeDays = [];
                this.asteriskTimeRule.initForDatePeriodRule();
                break;
            case 3:
                this.callRuleTimeDays = this.callRuleDays;
                this.asteriskTimeRule.initForWeekDaysRule();

                this.asteriskTimeRule.days.push(this.callRuleTimeDays[0].code);
                this.asteriskTimeRule.days.push(this.callRuleTimeDays[1].code);
                this.asteriskTimeRule.days.push(this.callRuleTimeDays[2].code);
                this.asteriskTimeRule.days.push(this.callRuleTimeDays[3].code);
                this.asteriskTimeRule.days.push(this.callRuleTimeDays[4].code);
                this.formatAsteriskRule();
                break;
            default:
                this.callRuleTimeDays = [];
                this.asteriskTimeRule.empty();
                break;
        }
        
        this.setCallRuleTimeDaysFormValue();
        this.formatAsteriskRule();
    }

    selectDay(idx: number): void {
        if (this.callRuleTimeDays[idx].type === 'accent') {
            const index = this.asteriskTimeRule.days.findIndex(day => {
                if (day.code === this.callRuleTimeDays[idx].code) {
                    return true;
                }
            });
            this.asteriskTimeRule.days.splice(index, 1);
        } else {
            this.asteriskTimeRule.days.push(this.callRuleTimeDays[idx].code);
        }      
        this.callRuleTimeDays[idx].type === 'accent' ? this.callRuleTimeDays[idx].type = 'cancel' : this.callRuleTimeDays[idx].type = 'accent';

        this.setCallRuleTimeDaysFormValue();
        this.formatAsteriskRule();
    }

    selectDurationTime(duration: any): void {
        this.selectedDurationTimeType = duration;
        this.setTimeTypeFormValue(this.durationTimeCtrl, duration.id);

        if (duration.id === 1) {
            this.asteriskTimeRule.time = '*';
        }
        else if (duration.id === 2) {
            this.selectedDurationTimeRange = [null, null];
            if (this.asteriskTimeRule && this.asteriskTimeRule.time === '*') {
                this.selectTime(this.callRuleTimes[0], 0);
                this.selectTime(this.callRuleTimes[0], 1);
            }
        }
        
        this.formatAsteriskRule();
    }

    selectTime(time: CallRuleTime, idx: number): void {
        if (!time) return;

        this.selectedDurationTimeRange[idx] = time;
        if (this.selectedDurationTimeRange[0] && this.selectedDurationTimeRange[1]) {
            this.asteriskTimeRule.time = `${this.selectedDurationTimeRange[0].asteriskTime}-${this.selectedDurationTimeRange[1].asteriskTime}`;
        }
        
        this.setDurationTimeRangeFormValue(idx, this.selectedDurationTimeRange[idx]);
        this.formatAsteriskRule();
    }

    // -- component methods ---------------------------------------------------

    private formatAsteriskRule(): void {
        let days = this.selectedCallRuleTimeType && this.selectedCallRuleTimeType.id === 3 ? '' : '*';

        if (this.asteriskTimeRule.days.length > 0) {
            days = this.asteriskTimeRule.days.join('&');
        }
        let rule = `${this.asteriskTimeRule.time}|${days}|${this.asteriskTimeRule.date}|${this.asteriskTimeRule.month}`;

        this.onChange.emit(rule);
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
// *|mon&tue&wed&thu&fri&sat&sun|*|*
// 10:09-11:10|sat&sun|*|*
