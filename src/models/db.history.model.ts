import {Type} from 'class-transformer';

import {PhoneNumberModel} from './phone-number.model';
import {months} from '../shared/vars';

export class DBHistoryItem {
  direction: string;
  status: boolean;
  duration: number;
  @Type(() => Date)
  date: Date;
  @Type(() => PhoneNumberModel)
  phone_number: PhoneNumberModel;
}

export class DBHistoryModel {
  @Type(() => Date)
  date: Date;
  @Type(() => DBHistoryItem)
  list: DBHistoryItem[];
  get analyzeDate(): string {
    const _date: Date = new Date();
    return _date.getMonth() === this.date.getMonth() ?
      _date.getDate() === this.date.getDate() ?
        'Today' : _date.getDate() - 1 === this.date.getDate() ?
        'Yesterday' : `${months[this.date.getMonth()]}/${this.date.getDate()}/${this.date.getFullYear()}` : `${months[this.date.getMonth()]}/${this.date.getDate()}/${this.date.getFullYear()}`;
  }
}
