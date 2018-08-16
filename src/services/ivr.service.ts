import {BaseService} from "./base.service";
import {IvrItem, IvrModel} from "../models/ivr.model";
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";

export class IvrService extends BaseService {

    pageInfo: IvrModel = new IvrModel();
    item: IvrItem;

    reset() {
        this.item = new IvrItem();
    }

    getById(id: number): Promise<IvrItem> {
        return super.getById(id).then((res: IvrItem) => {
            this.item = plainToClass(IvrItem, res);
            this.item.sipId = this.item.sip.id;
            return Promise.resolve(this.item);
        });
    }


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
        this.url = 'ivr';
    }

}
