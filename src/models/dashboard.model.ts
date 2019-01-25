import { Type } from 'class-transformer';
import { formatDate } from '@shared/shared.functions';

export class DashboardModel {
  balance: BalanceModel;
  tariffPlan: TariffPlanModel;
  numbers: NumberModel[];
  storage: StorageModel;
  callDetail: CallDetailModel[];
  cdrDetail: any;

  get outersCount() {
    return this.numbers.length;
  }

  get innersCount() {
    let result = 0;
    this.numbers.map((item: NumberModel) => {
      result += item.innerCount;
    });
    return result;
  }

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
  title: string = '';
  expired: string;
  sum: number = 0;

  get displayExpired() {
    return formatDate(this.expired);
  }
}

export class NumberModel {
  phoneNumber: string;
  innerCount: number;
  innerOnlineCount: number;
}

export class StorageModel {
  totalSize: number;
  usedSize: number;
  // availableSize: number;
  measure: string;

  get availableSize(): number {
    return Math.round((this.totalSize - this.usedSize) * 100) / 100;
  }
}


export class CallDetailItem {
  private static readonly _engAbbreviations = 'd|h|m|s';

  callDate: string;
  direction: number;
  source: string;
  destination: string;
  duration: number;
  status: number;
  isSms: number;
  name: string;
  loading: number = 0;
  tag: string;

  abbreviations: string[];

  get calculateDuration(): string {
    const sec = this.duration % 60;
    const min = ((this.duration - sec) / 60) % 60;
    const hr = ((this.duration - (sec + (min * 60))) / 60) / 60;

    if (!this.abbreviations) { 
      this.abbreviations = CallDetailItem._engAbbreviations.split('|');
    }
    const [ aD, aH, aM, aS ] = this.abbreviations;

    if (hr)  { return `${hr}${aH} ${min}${aM} ${sec}${aS}`; }
    if (min) { return `${min}${aM} ${sec}${aS}`; }
    if (sec) { return `${sec}${aS}`; }

    return null;
  }
}

export class CallDetailModel {
  date: string;
  @Type(() => CallDetailItem)
  list: CallDetailItem[] = [];

  get analyzeDate(): string {
    return this.date;
  }
}
