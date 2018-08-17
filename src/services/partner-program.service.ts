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
        return super.getItems(pageInfo, filter, sort).then((res: PartnerProgramModel) => {
            let pageInfo = this.plainToClassEx(PartnerProgramModel, PartnerProgramItem, res);
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'partner';
    }

}
