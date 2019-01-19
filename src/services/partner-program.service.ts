import {BaseService} from '@services/base.service';
import {PageInfoModel} from '@models/base.model';
import {PartnerProgramItem, PartnerProgramModel} from '@models/partner-program.model';


export class PartnerProgramService extends BaseService {

    save(id: number, name: string, status: boolean): Promise<any> {
        if (id) {
            return this.putById(id, {name: name, status: status}, false);
        } else {
            return this.post('', {name: name}, false);
        }
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<PartnerProgramModel> {
        return super.getItems(pageInfo, filter, sort).then((response: PartnerProgramModel) => {
            const pageInfoEx = this.plainToClassEx(PartnerProgramModel, PartnerProgramItem, response);
            return Promise.resolve(pageInfoEx);
        });
    }

    onInit() {
        this.url = 'partner';
    }

}
