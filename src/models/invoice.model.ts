import {PageInfoModel} from "./base.model";
import {Type} from "class-transformer";

export class InvoiceModel extends PageInfoModel {
    items: InvoiceItem[];
}


export class InvoiceItem {
    @Type(() => Date)
    created: Date;
    // number: string;
    // type: string;
    // date: Date;
    // status: string;
    // amount: number;
    // amount_vat: number;
    // transaction: string;

    get dateTime() {
        return `${this.created.toLocaleDateString()} ${this.created.toLocaleTimeString()}`;
    }

    get date() {
        return this.created.toLocaleDateString();
    }
}
