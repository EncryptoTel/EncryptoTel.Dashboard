import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {PartnerProgramItem, PartnerProgramModel} from "../models/partner-program.model";

export class PartnerProgramService extends BaseService {

    save(id: number, name: string, status: boolean): Promise<any> {
        if (id) {
            return this.putById(id, {name: name, status: status});
        } else {
            return this.post('', {name: name});
        }
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<PartnerProgramModel> {
        return super.getItems(pageInfo, filter, sort).then((response: PartnerProgramModel) => {
            let pageInfo = this.plainToClassEx(PartnerProgramModel, PartnerProgramItem, response);
            pageInfo.items.forEach(item => {
                // TODO: change status type returned from backend
                // item.status = item.status === 'Enable';
            });
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'partner';
    }

}
