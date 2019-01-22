import {plainToClass} from 'class-transformer';

import {BaseService} from './base.service';
import {CallRulesItem, CallRulesModel, CallRuleTimeType, CallRuleTime, CallRuleDay} from '../models/call-rules.model';
import {PageInfoModel} from '../models/base.model';
import {Injectable} from '@angular/core';

@Injectable()
export class CallRulesService extends BaseService {

    callRuleTimeTypes: CallRuleTimeType[];
    durationTimeTypes:  CallRuleTimeType[];
    callRuleTimes: CallRuleTime[];
    callRuleDays: CallRuleDay[];

    onInit() {
      this.url = 'outer_rule';
      this.initDictionaries();
      this.translate.onLangChange.subscribe(event => {
        this.initDictionaries();
      });
    }

    getOuters(): Promise<any> {
        return this.request.get(`v1/outer_rule/outers?limit=1000`);
    }

    getExtensions(id: number): Promise<any> {
        return this.request.get(`v1/outer_rule/inners?sipOuter=${id}`);
    }

    getFiles(): Promise<any> {
        return this.request.get(`v1/outer_rule/files?type=audio`);
    }

    getQueue(): Promise<any> {
        return this.request.get(`v1/outer_rule/call-queue`);
    }

    getGroup(): Promise<any> {
        return this.request.get(`v1/outer_rule/ring-group`);
    }

    edit(id: number, data): Promise<any> {
        return this.put(`/${id}`, data, false);
    }

    save(data): Promise<any> {
        return this.post('', data, false);
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<CallRulesModel> {
        return super.getItems(pageInfo, filter, sort)
            .then((response: CallRulesModel) => {
                const pageInfoNew = plainToClass(CallRulesModel, response);
                pageInfoNew.items = [];
                response['items'].map(item => {
                    pageInfoNew.items.push(plainToClass(CallRulesItem, item));
                });
                return Promise.resolve(pageInfoNew);
            });
    }

    initDictionaries(): void {
      this.callRuleTimeTypes = CallRuleTimeType.fromPlain([
        { id: 1, code: this.translate.instant('Always (24 hours)') },
        // { id: 2, code: 'Date (period)' },
        { id: 3, code: this.translate.instant('Days of the week') },
    ]);

    this.durationTimeTypes = CallRuleTimeType.fromPlain([
        { id: 1, code: this.translate.instant('Always (24 hours)') },
        { id: 2, code: this.translate.instant('Set the time') }
    ]);

    this.callRuleTimes = CallRuleTime.fromPlain([
        { time: this.translate.instant('amTime', { time: '12:00' }), asteriskTime: '00:00' },
        { time: this.translate.instant('amTime', { time: '1:00' }),  asteriskTime: '01:00' },
        { time: this.translate.instant('amTime', { time: '2:00' }),  asteriskTime: '02:00' },
        { time: this.translate.instant('amTime', { time: '3:00' }),  asteriskTime: '03:00' },
        { time: this.translate.instant('amTime', { time: '4:00' }),  asteriskTime: '04:00' },
        { time: this.translate.instant('amTime', { time: '5:00' }),  asteriskTime: '05:00' },
        { time: this.translate.instant('amTime', { time: '6:00' }),  asteriskTime: '06:00' },
        { time: this.translate.instant('amTime', { time: '7:00' }),  asteriskTime: '07:00' },
        { time: this.translate.instant('amTime', { time: '8:00' }),  asteriskTime: '08:00' },
        { time: this.translate.instant('amTime', { time: '9:00' }),  asteriskTime: '09:00' },
        { time: this.translate.instant('amTime', { time: '10:00' }), asteriskTime: '10:00' },
        { time: this.translate.instant('amTime', { time: '11:00' }), asteriskTime: '11:00' },
        { time: this.translate.instant('pmTime', { time: '12:00' }), asteriskTime: '12:00' },
        { time: this.translate.instant('pmTime', { time: '1:00' }),  asteriskTime: '13:00' },
        { time: this.translate.instant('pmTime', { time: '2:00' }),  asteriskTime: '14:00' },
        { time: this.translate.instant('pmTime', { time: '3:00' }),  asteriskTime: '15:00' },
        { time: this.translate.instant('pmTime', { time: '4:00' }),  asteriskTime: '16:00' },
        { time: this.translate.instant('pmTime', { time: '5:00' }),  asteriskTime: '17:00' },
        { time: this.translate.instant('pmTime', { time: '6:00' }),  asteriskTime: '18:00' },
        { time: this.translate.instant('pmTime', { time: '7:00' }),  asteriskTime: '19:00' },
        { time: this.translate.instant('pmTime', { time: '8:00' }),  asteriskTime: '20:00' },
        { time: this.translate.instant('pmTime', { time: '9:00' }),  asteriskTime: '21:00' },
        { time: this.translate.instant('pmTime', { time: '10:00' }), asteriskTime: '22:00' },
        { time: this.translate.instant('pmTime', { time: '11:00' }), asteriskTime: '23:00' },
    ]);

    this.callRuleDays = CallRuleDay.fromPlain([
        { type: 'accent', day: this.translate.instant('Mon'), code: 'mon' },
        { type: 'accent', day: this.translate.instant('Tue'), code: 'tue' },
        { type: 'accent', day: this.translate.instant('Wed'), code: 'wed' },
        { type: 'accent', day: this.translate.instant('Thu'), code: 'thu' },
        { type: 'accent', day: this.translate.instant('Fri'), code: 'fri' },
        { type: 'cancel', day: this.translate.instant('Sat'), code: 'sat' },
        { type: 'cancel', day: this.translate.instant('Sun'), code: 'sun' }
    ]);
  }
}
