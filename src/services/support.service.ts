import {BaseService} from './base.service';
import {plainToClass} from 'class-transformer';
import {SupportItemModel, SupportModel} from '@models/support.model';

export class SupportService extends BaseService {
    items: SupportItemModel[] = [];

    onInit() {
        this.url = 'support/ticket';
    }

    getItems(pageInfo: SupportModel, sort = null): Promise<SupportModel> {
        return super.getItems(pageInfo, null, sort).then((response: any) => {
            let pageinfo: SupportModel;
            pageinfo = this.plainToClassEx<SupportModel, SupportItemModel>(SupportModel, SupportItemModel, response);
            return Promise.resolve(pageinfo);
        });
    }

}
