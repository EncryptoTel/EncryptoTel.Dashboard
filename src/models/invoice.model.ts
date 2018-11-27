import { PageInfoModel } from './base.model';
import { Type, Transform } from 'class-transformer';
import { formatDate, formatDateTime } from '../shared/shared.functions';
import * as moment from 'moment';
export class InvoiceModel extends PageInfoModel {
    items: InvoiceItem[];
}

export class InvoiceItem {
    created: string;
    number: string;
    type: string;
    status: string;
    sum: number;
    sumWithVat: number;

    get displayDate() {
        return formatDate(this.created);
    }

    get displayDateTime() {
        return formatDateTime(this.created);
    }
}
