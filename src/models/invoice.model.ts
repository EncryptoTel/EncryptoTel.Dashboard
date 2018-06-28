import {Type} from "class-transformer";

export class InvoiceModel {
    number: string;
    type: string;
    @Type(() => Date)
    date: Date;
    status: string;
    amount: number;
    amount_vat: number;
    transaction: string;
}
