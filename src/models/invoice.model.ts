import {PageInfoModel} from "./base.model";
import {Type} from "class-transformer";
import {formatDate, formatDateTime} from "../shared/shared.functions";

export class InvoiceModel extends PageInfoModel {
    items: InvoiceItem[];
}


export class InvoiceItem {
    @Type(() => Date)
    created: Date;
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
