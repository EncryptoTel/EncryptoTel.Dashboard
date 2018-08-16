import {BaseService} from "./base.service";
import {SessionItem, SessionsModel} from "../models/settings.models";
import {PageInfoModel} from "../models/base.model";

export class SessionsService extends BaseService {

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<any> {
        return super.getItems(pageInfo, filter, sort).then((res: SessionsModel) => {
            return Promise.resolve(this.plainToClassEx(SessionsModel, SessionItem, res))
        });
    }

    onInit() {
        this.url = 'settings/user/profile/sessions';
    }

}
