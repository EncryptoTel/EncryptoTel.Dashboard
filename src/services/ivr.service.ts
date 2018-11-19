import {BaseService} from '@services/base.service';
import {IvrItem, IvrModel, IvrTreeItem} from '@models/ivr.model';
import {PageInfoModel} from '@models/base.model';
import {plainToClass} from 'class-transformer';


export class IvrService extends BaseService {

    pageInfo: IvrModel = new IvrModel();
    item: IvrItem;

    actions: any[] = [];
    digits: any[] = [];

    reset() {
        this.item = new IvrItem();
    }

    getById(id: number): Promise<IvrItem> {
        console.log("getById");
        return super.getById(id).then((res: IvrItem) => {
            this.item = plainToClass(IvrItem, res);
            this.item.sipId = this.item.sip.id;
            return Promise.resolve(this.item);
        });
    }


    edit(id: number, data): Promise<any> {
        console.log("Edit");
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

    getExtensions(id: number): Promise<any> {
        return this.request.get(`v1/outer_rule/inners?sipOuter=${id}`);
    }

    onInit() {
        this.url = 'ivr';
    }
    
    getFiles() {
        return this.request.get('v1/account/file?type=audio')
    }

    getParams(): Promise<any> {
        return this.request.get(`v1/ivr/params`);
    }
}
