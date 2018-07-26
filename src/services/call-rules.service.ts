import {BaseService} from "./base.service";
import {CallRulesItem, CallRulesModel} from "../models/call-rules.model";
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";

export class CallRulesService extends BaseService {

    getExtensions(id: number): Promise<any> {
        return this.request.get(`v1/sip/inners?sipOuter=${id}`);
    }

    getFiles(): Promise<any> {
        return this.request.get(`v1/account/file?type=audio`);
    }

    getQueue(): Promise<any> {
        return this.request.get(`v1/call_queue`);
    }

    edit(id: number, data): Promise<any> {
        return this.put(`/${id}`, data);
    }

    save(data): Promise<any> {
        return this.post('', data);
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<CallRulesModel> {
        return super.getItems(pageInfo, filter).then((res: CallRulesModel) => {
            let pageInfo = plainToClass(CallRulesModel, res);
            pageInfo.items = [];
            res['items'].map(item => {
                pageInfo.items.push(plainToClass(CallRulesItem, item));
            });
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'v1/outer_rule';
    }

}
