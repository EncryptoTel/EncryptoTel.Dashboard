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

    edit(id: number, data): Promise<any> {
        return this.put(`/${id}`, data);
    }

    save(data): Promise<any> {
        return this.post('', data);
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<CallRulesModel> {
        return super.getItems(pageInfo, filter).then((res: CallRulesModel) => {
            let pageInfo = plainToClass(CallRulesModel, res);
            pageInfo.items = [];
            res['items'].map(item => {
                pageInfo.items.push(plainToClass(CallRulesItem, item));
            });
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'outer_rule';

        this.callRuleTimeTypes = CallRuleTimeType.fromPlain([
            { id: 1, code: 'Always (24 hours)' },
            // { id: 2, code: 'Date (period)' },
            { id: 3, code: 'Days of the week' },
        ]);

        this.durationTimeTypes = CallRuleTimeType.fromPlain([
            { id: 1, code: 'Always (24 hours)' },
            { id: 2, code: 'Set the time' }
        ]);

        this.callRuleTimes = CallRuleTime.fromPlain([
            { time: '12:00 a.m', asteriskTime: '00:00' },
            { time: '1:00 a.m',  asteriskTime: '01:00' },
            { time: '2:00 a.m',  asteriskTime: '02:00' },
            { time: '3:00 a.m',  asteriskTime: '03:00' },
            { time: '4:00 a.m',  asteriskTime: '04:00' },
            { time: '5:00 a.m',  asteriskTime: '05:00' },
            { time: '6:00 a.m',  asteriskTime: '06:00' },
            { time: '7:00 a.m',  asteriskTime: '07:00' },
            { time: '8:00 a.m',  asteriskTime: '08:00' },
            { time: '9:00 a.m',  asteriskTime: '09:00' },
            { time: '10:00 a.m', asteriskTime: '10:00' },
            { time: '11:00 a.m', asteriskTime: '11:00' },
            { time: '12:00 p.m', asteriskTime: '12:00' },
            { time: '1:00 p.m',  asteriskTime: '13:00' },
            { time: '2:00 p.m',  asteriskTime: '14:00' },
            { time: '3:00 p.m',  asteriskTime: '15:00' },
            { time: '4:00 p.m',  asteriskTime: '16:00' },
            { time: '5:00 p.m',  asteriskTime: '17:00' },
            { time: '6:00 p.m',  asteriskTime: '18:00' },
            { time: '7:00 p.m',  asteriskTime: '19:00' },
            { time: '8:00 p.m',  asteriskTime: '20:00' },
            { time: '9:00 p.m',  asteriskTime: '21:00' },
            { time: '10:00 p.m', asteriskTime: '22:00' },
            { time: '11:00 p.m', asteriskTime: '23:00' },
        ]);

        this.callRuleDays = CallRuleDay.fromPlain([
            { type: 'accent', day: 'Mon', code: 'mon' },
            { type: 'accent', day: 'Tue', code: 'tue' },
            { type: 'accent', day: 'Wed', code: 'wed' },
            { type: 'accent', day: 'Thu', code: 'thu' },
            { type: 'accent', day: 'Fri', code: 'fri' },
            { type: 'cancel', day: 'Sat', code: 'sat' },
            { type: 'cancel', day: 'Sun', code: 'sun' }
        ]);
    }

}
