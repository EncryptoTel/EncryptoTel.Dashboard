import {BaseService} from "./base.service";
import {IvrItem, IvrModel} from "../models/ivr.model";
import {PageInfoModel} from "../models/base.model";

export class IvrService extends BaseService {

    pageInfo: IvrModel = new IvrModel();

    edit(id: number, data): Promise<any> {
        return this.put(`/${id}`, data);
    }

    save(data): Promise<any> {
        return this.post('', data);
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<IvrModel> {
        return super.getItems(pageInfo, filter).then((res: IvrModel) => {
            this.pageInfo = this.plainToClassEx(IvrModel, IvrItem, res);
            return Promise.resolve(this.pageInfo);
        });
    }

    onInit() {
        this.url = 'v1/ivr';
    }

}
