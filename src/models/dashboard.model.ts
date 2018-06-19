import {Type} from "class-transformer";
import {months} from "../shared/vars";

export class DashboardModel {
    balance: BalanceModel;
    tariffPlan: TariffPlanModel;
    numbers: NumberModel[];
    storage: StorageModel;
    callDetail: CallDetailModel[];
}

export class BalanceModel {
    value: number;
    currency: CurrencyModel;
    ett: number;
}

export class CurrencyModel {
    code: string;
    name: string;
    shortName: string;
}

export class TariffPlanModel {
    title: string;
    @Type(() => Date)
    expired: Date;
    sum: number;
}

export class NumberModel {
    phoneNumber: string;
    innerCount: number;
    innerOnlineCount: number;
}

export class StorageModel {
    totalSize: number;
    usedSize: number;
    measure: string;
}


export class CallDetailItem {
    @Type(() => Date)
    callDate: Date;
    direction: number;
    source: string;
    destination: string;
    duration: number;
    status: number;
    isSms: number;
    name: string;
    get calculateDuration(): string {
        const sec = this.duration % 60;
        const min = ((this.duration - sec) / 60) % 60;
        const hr = ((this.duration - (sec + (min * 60))) / 60) / 60;
        return hr ? `${hr}h ${min}m ${sec}s` : min ? `${min}m ${sec}s` : sec ? `${sec}s` : null;
    }
}

export class CallDetailModel {
    @Type(() => Date)
    date: Date;
    @Type(() => CallDetailItem)
    list: CallDetailItem[];
    get analyzeDate(): string {
        const _date: Date = new Date();
        return _date.getMonth() === this.date.getMonth() ?
            _date.getDate() === this.date.getDate() ?
                'Today' : _date.getDate() - 1 === this.date.getDate() ?
                'Yesterday' : `${months[this.date.getMonth()]}/${this.date.getDate()}/${this.date.getFullYear()}`
            : `${months[this.date.getMonth()]}/${this.date.getDate()}/${this.date.getFullYear()}`;
    }
}
//
// export class CallDetailModel {
//     @Type(() => Date)
//     callDate: Date;
//     direction: number;
//     source: string;
//     destination: string;
//     duration: number;
//     isSms: number;
//     name: string;
//     get analyzeDate(): string {
//         const _date: Date = new Date();
//         return _date.getMonth() === this.callDate.getMonth() ?
//             _date.getDate() === this.callDate.getDate() ?
//                 'Today' : _date.getDate() - 1 === this.callDate.getDate() ?
//                 'Yesterday' : `${months[this.callDate.getMonth()]}/${this.callDate.getDate()}/${this.callDate.getFullYear()}`
//             : `${months[this.callDate.getMonth()]}/${this.callDate.getDate()}/${this.callDate.getFullYear()}`;
//     }
//     get calculateDuration(): string {
//         const sec = this.duration % 60;
//         const min = ((this.duration - sec) / 60) % 60;
//         const hr = ((this.duration - (sec + (min * 60))) / 60) / 60;
//         return hr ? `${hr}h ${min}m ${sec}s` : min ? `${min}m ${sec}s` : sec ? `${sec}s` : null;
//     }
// }
