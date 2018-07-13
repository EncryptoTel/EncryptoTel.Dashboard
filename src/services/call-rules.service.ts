import {BaseService} from "./base.service";
import {CallRulesItem, CallRulesModel} from "../models/call-rules.model";
import {PageInfoModel} from "../models/base.model";
import {plainToClass} from "class-transformer";

export class CallRulesService extends BaseService {

    edit(id: number, rules): Promise<any> {
        return this.request.put(`v1/outer_rule/${id}`, rules);
    }

    getEditedCallRule(id: number): Promise<any> {
        return this.request.get(`v1/outer_rule/${id}`);
    }

    getExtensions(id: number): Promise<any> {
        return this.request.get(`v1/sip/inners?sipOuter=${id}`);
    }

    getFiles(): Promise<any> {
        return this.request.get(`v1/account/file?type=audio`);
    }

    getParams(): Promise<any> {
        return this.request.get(`v1/outer_rule/params`);
    }

    getQueue(): Promise<any> {
        return this.request.get(`v1/call_queue`);
    }

    save(rules): Promise<any> {
        return this.request.post(`v1/outer_rule`, rules);
    }





    getCallRules(pageInfo: PageInfoModel, filter = null): Promise<CallRulesModel> {
        return this.getItems(pageInfo, filter).then((res: CallRulesModel) => {
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
