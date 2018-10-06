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
    
    @Input() action: FormGroup;
    @Input() actionIndex: number;
    @Input() validationHost: ValidationHost;
    
    @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

    asteriskTimeRule: AsteriskTimeRule;
    callRuleTimeDays: CallRuleDay[];
    selectedCallRuleTimeType: CallRuleTimeType;
    selectedDurationTimeType: CallRuleTimeType;
    selectedDurationTimeRange: CallRuleTime[];

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
        this.callRuleTimeDays = [];
    }
    
    ngOnInit() {
        this.callRuleTimeDays = this.service.callRuleDays.map<CallRuleDay>(day => Object.assign({}, day));

        const timeRules = this.action.get('timeRules') ? this.action.get('timeRules').value : null;
        const rules = timeRules ? timeRules.split('|') : null;

        if (!rules || rules[0] === '*') {
            this.selectedDurationTimeType = this.durationTimeTypes[0];
            this.asteriskTimeRule.time = '*';
        } else {
            this.selectedDurationTimeType = this.durationTimeTypes[1];
            this.asteriskTimeRule.time = rules[0];

            const times = rules[0].split('-');
            this.selectedDurationTimeRange = [
                this.callRuleTimes.find(t => t.asteriskTime === times[0]),
                this.callRuleTimes.find(t => t.asteriskTime === times[1])
            ];
        }
        
        if (!rules || rules[1] === '*') {
            this.selectTimeRule(this.callRuleTimeTypes[0], true);
        } else {
            this.selectTimeRule(this.callRuleTimeTypes[1], true);
            
            this.callRuleTimeDays.forEach(d => d.type = 'cancel');
            const weekDays = rules[1].split('&');
            weekDays.forEach(day => {
                this.callRuleTimeDays.map(d => { if (d.code == day) d.type = 'accent'; });
            });
            this.initAsteriskRuleDays();
        }
        
        this.formatAsteriskRule();
    }

    // -- event handlers ------------------------------------------------------

    selectTimeRule(rule: CallRuleTimeType, silentMode: boolean = false): void {
        this.selectedCallRuleTimeType = rule;

        switch (rule.id) {
            case 1:
                this.asteriskTimeRule.initForAlwaysRule();
                break;
            case 2:
                this.asteriskTimeRule.initForDatePeriodRule();
                break;
            case 3:
                this.initAsteriskRuleDays();
                break;
            default:
                this.asteriskTimeRule.empty();
                break;
        }
        
        if (!silentMode) this.formatAsteriskRule();
    }

    initAsteriskRuleDays(): void {
        this.asteriskTimeRule.initForWeekDaysRule();

        this.callRuleTimeDays
            .filter(d => d.type === 'accent')
            .forEach(d => this.asteriskTimeRule.days.push(d.code));
    }

    selectDay(idx: number): void {
        this.callRuleTimeDays[idx].type = (this.callRuleTimeDays[idx].type === 'accent') ? 'cancel' : 'accent';
        this.initAsteriskRuleDays();

        this.action.get('callRuleTime').markAsTouched();

        this.formatAsteriskRule();
    }

    selectDurationTime(duration: any): void {
        if (!this.selectedDurationTimeType || this.selectedDurationTimeType.id !== duration.id) {
            this.selectedDurationTimeType = duration;

            if (duration.id === 1) {
                this.asteriskTimeRule.time = '*';
            }
            else if (duration.id === 2) {
                this.selectedDurationTimeRange = [null, null];
                if (this.asteriskTimeRule && this.asteriskTimeRule.time === '*') {
                    this.selectTime(this.callRuleTimes[0], 0);
                    this.selectTime(this.callRuleTimes[1], 1);
                }
            }
            
            this.formatAsteriskRule();
        }
    }

    selectTime(time: CallRuleTime, idx: number): void {
        if (!time) return;

        this.selectedDurationTimeRange[idx] = time;
        this.setAsteriskTime();
        
        this.formatAsteriskRule();

        this.validationHost.forceFocused(`ruleActions.${this.actionIndex}.durationTime`);
    }

    // -- component methods ---------------------------------------------------

    private setAsteriskTime(): void {
        if (this.selectedDurationTimeRange[0] && this.selectedDurationTimeRange[1]) {
            this.asteriskTimeRule.time = `${this.selectedDurationTimeRange[0].asteriskTime}-${this.selectedDurationTimeRange[1].asteriskTime}`;
        }
    }

    private formatAsteriskRule(): void {
        let days = this.selectedCallRuleTimeType && this.selectedCallRuleTimeType.id === 3 ? '' : '*';

        if (this.asteriskTimeRule.days.length > 0) {
            days = this.asteriskTimeRule.days.join('&');
        }
        let rule = `${this.asteriskTimeRule.time}|${days}|${this.asteriskTimeRule.date}|${this.asteriskTimeRule.month}`;

        this.action.get('callRuleTime').setValue(days);
        this.action.get('durationTime').setValue(this.asteriskTimeRule.time);

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
