import {BaseService} from './base.service';
import {PageInfoModel} from '../models/base.model';
import {InvoiceItem, InvoiceModel} from '../models/invoice.model';

export class InvoiceService extends BaseService {

    onInit() {
        this.url = 'invoice';
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<InvoiceModel> {
        return super.getItems(pageInfo, filter, sort).then((res: InvoiceModel) => {
            const invoicesData = this.plainToClassEx(InvoiceModel, InvoiceItem, res);

            if (invoicesData instanceof InvoiceModel) {
                invoicesData.items.forEach(item => {
                    item = this.addLeadingZeros(item);
                    return item;
                });
            }
            
            return Promise.resolve(invoicesData);
        });
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
