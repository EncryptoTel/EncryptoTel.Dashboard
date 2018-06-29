import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'call-rules-time-rules',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class CallRulesTimeRulesComponent implements OnInit {
    @Input() action: any;
    @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

    ruleTime = [
        {id: 1, code: 'Always (24 hours)'},
        // {id: 2, code: 'Date (period)'},
        {id: 3, code: 'Days of the week'},
    ];
    duration = [
        {id: 1, code: 'Always (24 hours)'},
        {id: 2, code: 'Set the time'}
    ];
    durationTime = [
        {time: '0 a.m', timeAster: '00:00'},
        {time: '1 a.m', timeAster: '01:00'},
        {time: '2 a.m', timeAster: '02:00'},
        {time: '3 a.m', timeAster: '03:00'},
        {time: '4 a.m', timeAster: '04:00'},
        {time: '5 a.m', timeAster: '05:00'},
        {time: '6 a.m', timeAster: '06:00'},
        {time: '7 a.m', timeAster: '07:00'},
        {time: '8 a.m', timeAster: '08:00'},
        {time: '9 a.m', timeAster: '09:00'},
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
    ];
    days;
    ruleTimeAsterisk;
    selectedRuleTime;
    selectedDurationTime;
    selectedDuration;

    selectRuleTime(rule): void {
        if (!this.ruleTimeAsterisk) {
            this.ruleTimeAsterisk = {
                days: [],
                date: '',
                month: '',
                time: ''
            };
        }
        this.selectedRuleTime = rule;
        // this.actionsControls.get([`${i}`, `parameter`]).setValue(rule.id);
        switch (rule.id) {
            case 1:
                this.days = [];
                this.ruleTimeAsterisk.days = ['*'];
                this.ruleTimeAsterisk.date = '*';
                this.ruleTimeAsterisk.month = '*';
                break;
            case 2:
                this.days = [];
                this.ruleTimeAsterisk.days = ['*'];
                this.ruleTimeAsterisk.date = '';
                this.ruleTimeAsterisk.month = '';
                break;
            case 3:
                this.days = [
                    {type: 'cancel', day: 'Mon', code: 'mon'},
                    {type: 'cancel', day: 'Tue', code: 'tue'},
                    {type: 'cancel', day: 'Wed', code: 'wed'},
                    {type: 'cancel', day: 'Thu', code: 'thu'},
                    {type: 'cancel', day: 'Fri', code: 'fri'},
                    {type: 'cancel', day: 'Sat', code: 'sat'},
                    {type: 'cancel', day: 'Sun', code: 'sun'}
                ];
                this.ruleTimeAsterisk.days = [];
                this.ruleTimeAsterisk.date = '*';
                this.ruleTimeAsterisk.month = '*';
                break;
            default:
                this.days = [];
                this.ruleTimeAsterisk.days = [];
                this.ruleTimeAsterisk.date = '';
                this.ruleTimeAsterisk.month = '';
                break;
        }
        this.formatAsterRule();
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
        this.formatAsterRule();
    }

    selectDurationTime(duration): void {
        this.selectedDurationTime = duration;
        // this.actionsControls.get([`${i}`, `parameter`]).setValue(duration.id);
        if (duration.id === 1) {
            if (!this.ruleTimeAsterisk) {
                this.ruleTimeAsterisk = {
                    days: [],
                    date: '',
                    month: '',
                    time: ''
                };
            }
            this.ruleTimeAsterisk.time = '*';
        } else if (duration.id === 2) {
            this.selectedDuration = [[], []];
            if (!this.ruleTimeAsterisk) {
                this.ruleTimeAsterisk = {
                    days: [],
                    date: '',
                    month: '',
                    time: ''
                };
            }
        }
        this.formatAsterRule();
    }

    selectTime(time, idx): void {
        // console.log(time);
        this.selectedDuration[idx] = time;
        this.ruleTimeAsterisk.time = `${this.selectedDuration[0].timeAster}-${this.selectedDuration[1].timeAster}`;
        this.formatAsterRule();
    }

    private formatAsterRule(): void {
        let days = '*';
        this.ruleTimeAsterisk.days.forEach((day, index) => {
            if (index === 0) {
                days = day;
            } else {
                days = days + '&' + day;
            }
        });
        let rule = `${this.ruleTimeAsterisk.time}|${days}|${this.ruleTimeAsterisk.date}|${this.ruleTimeAsterisk.month}`;
        console.log(rule);
        this.onChange.emit(rule);
    }

    isError(): boolean {
        return this.action.get('timeRules') && this.action.get('timeRules').touched && this.action.get('timeRules').invalid;
    }

    ngOnInit() {
        // console.log('time-rules init', this.action);
        const timeRules = this.action.get('timeRules').value;
        // console.log(timeRules);
        const rules = timeRules.split('|');
        // console.log(rules);

        if (rules[0] === '*') {
            this.selectDurationTime(this.duration[0]);
        } else {
            this.selectDurationTime(this.duration[1]);
            const times = rules[0].split('-');
            this.selectTime(this.durationTime.find(item => item.timeAster === times[0]), 0);
            this.selectTime(this.durationTime.find(item => item.timeAster === times[1]), 1);
        }
        if (rules[1] === '*') {
            this.selectRuleTime(this.ruleTime[0]);
        } else {
            this.selectRuleTime(this.ruleTime[1]);
            const weekDays = rules[1].split('&');
            weekDays.forEach(day => {
                console.log(day);
                this.selectDay(this.days.indexOf(this.days.find(item => item.code === day)));
            });
        }

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