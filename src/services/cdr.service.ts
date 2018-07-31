import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {CdrItem, CdrModel} from "../models/cdr.model";

export class CdrService extends BaseService {

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<CdrModel> {
        return super.getItems(pageInfo, filter, sort).then((res: CdrModel) => {
            let pageInfo = this.plainToClassEx(CdrModel, CdrItem, res);
            return Promise.resolve(pageInfo);
        });
    }

    getRecordMedia(id: number): Promise<any> {
        return this.request.get(`v1/account/file/${id}`);
    }

    onInit() {
        this.url = 'v1/cdr';
    }

}
