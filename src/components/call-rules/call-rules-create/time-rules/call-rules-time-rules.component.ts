import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {AsteriskTimeRule, CallRuleTimeType, CallRuleTime, CallRuleDay} from '../../../../models/call-rules.model';
import {ValidationHost} from '../../../../models/validation-host.model';
import {CallRulesService} from '../../../../services/call-rules.service';


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

    days;
    ruleTimeAsterisk: AsteriskTimeRule;
    selectedRuleTime;
    selectedDurationTime;
    selectedDuration;
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

    // -- component lifecycle methods -----------------------------------------

    constructor(private service: CallRulesService) {
        this.ruleTimeAsterisk = new AsteriskTimeRule();
    }
    
    ngOnInit() {
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
                this.selectDay(this.days.indexOf(this.days.find(item => item.code === day)));
            });
        }

    }

    // -- event handlers ------------------------------------------------------

    selectTimeRule(rule): void {
        console.log('time-rule', rule);
        this.selectedRuleTime = rule;
        // this.actionsControls.get([`${i}`, `parameter`]).setValue(rule.id);
        switch (rule.id) {
            case 1:
                this.days = [];
                this.ruleTimeAsterisk.initForAlwaysRule();
                break;
            case 2:
                this.days = [];
                this.ruleTimeAsterisk.initForDatePeriodRule();
                break;
            case 3:
                this.days = this.callRuleDays;
                this.ruleTimeAsterisk.initForWeekDaysRule();

                this.ruleTimeAsterisk.days.push(this.days[0].code);
                this.ruleTimeAsterisk.days.push(this.days[1].code);
                this.ruleTimeAsterisk.days.push(this.days[2].code);
                this.ruleTimeAsterisk.days.push(this.days[3].code);
                this.ruleTimeAsterisk.days.push(this.days[4].code);
                this.formatAsteriskRule();
                break;
            default:
                this.days = [];
                this.ruleTimeAsterisk.empty();
                break;
        }
        this.formatAsteriskRule();
    }

    selectDay(idx: number): void {
        if (this.days[idx].type === 'accent') {
            const index = this.ruleTimeAsterisk.days.findIndex(day => {
                if (day.code === this.days[idx].code) {
                    return true;
                }
            });
            this.ruleTimeAsterisk.days.splice(index, 1);
        } else {
            this.ruleTimeAsterisk.days.push(this.days[idx].code);
        }
        this.days[idx].type === 'accent' ? this.days[idx].type = 'cancel' : this.days[idx].type = 'accent';
        this.formatAsteriskRule();
    }

    selectDurationTime(duration: any): void {
        this.selectedDurationTime = duration;
        // this.actionsControls.get([`${i}`, `parameter`]).setValue(duration.id);
        if (duration.id === 1) {
            this.ruleTimeAsterisk.time = '*';
        }
        else if (duration.id === 2) {
            this.selectedDuration = [[], []];
            if (this.ruleTimeAsterisk && this.ruleTimeAsterisk.time === '*') {
                this.selectTime(this.callRuleTimes[0], 0);
                this.selectTime(this.callRuleTimes[0], 1);
            }
        }
        this.formatAsteriskRule();
    }

    // -- component methods ---------------------------------------------------

    selectTime(time, idx): void {
        if (!time) return;

        this.selectedDuration[idx] = time;
        this.ruleTimeAsterisk.time = `${this.selectedDuration[0].timeAster}-${this.selectedDuration[1].timeAster}`;
        this.formatAsteriskRule();
    }

    private formatAsteriskRule(): void {
        let days = this.selectedRuleTime && this.selectedRuleTime.id === 3 ? '' : '*';
        if (this.ruleTimeAsterisk.days.length > 0) {
            days = this.ruleTimeAsterisk.days.join('&');
        }
        let rule = `${this.ruleTimeAsterisk.time}|${days}|${this.ruleTimeAsterisk.date}|${this.ruleTimeAsterisk.month}`;
        // this.logger.log('formatAsterRule', rule);

        // this.errors.ruleTime = days === '' ? 'Please select days' : '';
        // this.errors.durationTime = (
        //         (this.ruleTimeAsterisk.time === '')
        //         || (this.selectedDuration && (this.selectedDuration[0].timeAster === undefined || this.selectedDuration[1].timeAster === undefined))
        //     )
        //     ? 'Please select time'
        //     : '';

        this.onChange.emit(rule);
    }

    // isError(): boolean {
    //     return this.action.get('timeRules') && this.action.get('timeRules').touched && this.action.get('timeRules').invalid;
    // }
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
