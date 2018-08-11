import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {DepartmentItem, DepartmentModel} from "../models/department.model";

export class DepartmentService extends BaseService {

    save(id: number, department): Promise<any> {
        if (id) {
            return this.putById(id, department);
        } else {
            return this.post('', department);
        }
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<DepartmentModel> {
        return super.getItems(pageInfo, filter).then((res: DepartmentModel) => {
            let pageInfo = this.plainToClassEx(DepartmentModel, DepartmentItem, res);
            return Promise.resolve(pageInfo);
        });
    }

    onInit() {
        this.url = 'department';
    }

}
