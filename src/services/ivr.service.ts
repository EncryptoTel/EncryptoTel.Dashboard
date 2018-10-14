import {BaseService} from "./base.service";
import {IvrItem, IvrModel, IvrTreeItem} from "../models/ivr.model";
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";

export class IvrService extends BaseService {

    pageInfo: IvrModel = new IvrModel();
    item: IvrItem;

    actions: any[] = [];
    digits: any[] = [];

    reset() {
        this.item = new IvrItem();
    }

    getById(id: number): Promise<IvrItem> {
        this.mockIVRData();
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

    getExtensions(id: number): Promise<any> {
        return this.request.get(`v1/outer_rule/inners?sipOuter=${id}`);
    }

    onInit() {
        this.url = 'ivr';
    }
    
    mockIVRData(): void {

        // -- items --

        this.item = new IvrItem();

        this.item.id = 1;
        this.item.name = 'IVR-1';
        this.item.description = 'IVR Description';
        this.item.status = 1;

        this.item.tree = [];
        
        let node = new IvrTreeItem();
        
        node.id = 1;
        node.level = 0;
        node.digit = '1';
        node.action = 'Send to IVR';
        node.description = 'Sale';
        
        this.item.tree.push(node);

        node = new IvrTreeItem();

        node.id = 2;
        node.level = 0;
        node.digit = '2';
        node.action = 'Send to IVR';
        node.description = 'Balance';
        
        this.item.tree.push(node);

        node = new IvrTreeItem();

        node.id = 3;
        node.level = 0;
        node.digit = '3';
        node.action = 'Send to IVR';
        node.description = 'IT Department';
        
        this.item.tree.push(node);

        node = new IvrTreeItem();

        node.id = 101;
        node.level = 1;
        node.digit = '1';
        node.action = 'Send to IVR';
        node.description = 'Accountant Department';
        
        this.item.tree.push(node);

        // -- actions --

        this.actions = [
            { id: 1, title: 'Redirect to extension number' },
            { id: 2, title: 'Redirect to external number' },
            { id: 3, title: 'Send to IVR' },
        ];

        // -- digit --
        this.digits = [];
        for (let i = 1; i <= 10; i ++) {
            let number = i % 10;
            this.digits.push({ id: number, title: number.toString() });
        }
    }
}
