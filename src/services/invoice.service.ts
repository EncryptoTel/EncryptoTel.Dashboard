import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {InvoiceItem, InvoiceModel} from "../models/invoice.model";

export class InvoiceService extends BaseService {

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<InvoiceModel> {
        return super.getItems(pageInfo, filter, sort).then((res: InvoiceModel) => {
            let pageInfo = this.plainToClassEx(InvoiceModel, InvoiceItem, res);
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'v1/invoice';
    }

}
