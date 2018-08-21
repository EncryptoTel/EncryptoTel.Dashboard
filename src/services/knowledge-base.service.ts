import {BaseService} from './base.service';
import {PageInfoModel} from '../models/base.model';
import {HelpGroupItem, HelpGroupModel, HelpItem, HelpModel} from '../models/knowledge-base.model';

export class KnowledgeBaseService extends BaseService {

    getGroups(pageInfo: PageInfoModel, filter = null): Promise<HelpGroupModel> {
        this.url = 'help/group';
        return super.getItems(pageInfo, filter).then((res: HelpGroupModel) => {
            let pageInfo: HelpGroupModel;
            pageInfo = this.plainToClassEx(HelpGroupModel, HelpGroupItem, res);
            return Promise.resolve(pageInfo);
        });
    }

    getHelps(pageInfo: PageInfoModel, filter = null): Promise<HelpModel> {
        this.url = 'help';
        return super.getItems(pageInfo, filter).then((res: HelpModel) => {
            let pageInfo = this.plainToClassEx(HelpModel, HelpItem, res);
            return Promise.resolve(pageInfo);
        });
    }

}
