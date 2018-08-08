import {BaseItemModel, PageInfoModel} from "./base.model";

export class CallRulesModel extends PageInfoModel{
    items: CallRulesItem[];
}

export class CallRulesItem extends BaseItemModel {
    name: string;
    description: string;
    enabled: boolean;
    sip: SipItem;
    ruleActions: RuleActionItem[];

    get phoneNumber() {
        return this.sip ? this.sip.phoneNumber : null;
    }

    get statusName() {
        return this.enabled ? 'enabled' : 'disabled';
    }

}

export class SipItem extends BaseItemModel {
    phoneNumber: string;
}

export class RuleActionItem extends BaseItemModel {
    action: number;
    parameter: string;
    timeRules: string;
    timeout: number;
    description: string;
}




export class Action {
    constructor(public id: number,
                public code: string) {
    }
}

export class SipInner {
    constructor(public id: number,
                public phoneNumber: string) {
    }
}

export class CallRules {
    constructor(public name: string,
                public description: string,
                public sip: object,
                public ruleAction: object,
                public id?: number,
                public statusParameter?: string,
                public status?: number) {
    }
}

export class AsteriskTimeRule {
    public days: any[];
    public date: string;
    public time: string;
    public month: string;

    constructor() {
        this.empty();
    }

    empty(): void {
        this.days = [];
        this.date = '';
        this.time = '';
        this.month = '';
    }

    initForAlwaysRule(): void {
        this.days = ['*'];
        this.date  = '*';
        this.month = '*';
    }

    initForWeekDaysRule(): void {
        this.days = [];
        this.date = '*';
        this.month = '*';
    }

    initForDatePeriodRule(): void {
        this.days = ['*'];
        this.date = '';
        this.month = '';
    }
}