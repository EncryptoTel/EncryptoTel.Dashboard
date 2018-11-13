import {BaseService} from './base.service';
import {PageInfoModel} from '../models/base.model';
import {InvoiceItem, InvoiceModel} from '../models/invoice.model';

export class InvoiceService extends BaseService {

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<InvoiceModel> {
        return super.getItems(pageInfo, filter, sort).then((res: InvoiceModel) => {
            let pageInfo = this.plainToClassEx(InvoiceModel, InvoiceItem, res);

            if (pageInfo instanceof InvoiceModel) {
                pageInfo.items.forEach(item => {
                    item = this.addLeadingZeros(item);
                    return item;
                });
            }
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'invoice';
    }

    addLeadingZeros(item) {
        let sNum: string;
        let len: number = 12;
        len -= String(item.id).length;
        sNum = item.number;
        while (len--) {
            sNum = '0' + sNum;
        }
        if (item.type === 'Bill') {
            item.number = 'B' + sNum;
        } else {
            item.number = 'P' + sNum;
        }
        return item;
    }
}
