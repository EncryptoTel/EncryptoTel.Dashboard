import {BaseService} from '@services/base.service';
import {SessionItem, SessionsModel} from '@models/settings.models';
import {PageInfoModel} from '@models/base.model';


export class SessionsService extends BaseService {

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<any> {
        return super.getItems(pageInfo, filter, sort)
            .then((response: SessionsModel) => {
                return Promise.resolve(this.plainToClassEx(SessionsModel, SessionItem, response));
            });
    }

    onInit() {
        this.url = 'settings/user/profile/sessions';
    }
}
