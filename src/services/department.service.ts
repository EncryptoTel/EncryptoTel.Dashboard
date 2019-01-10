import { plainToClass } from 'class-transformer';

import { BaseService } from '@services/base.service';
import { PageInfoModel } from '@models/base.model';
import { DepartmentItem, DepartmentModel } from '@models/department.model';


export class DepartmentService extends BaseService {
    editMode: boolean = false;

    onInit() {
        this.url = 'department';
    }

    getItems(pageInfo: PageInfoModel, filter = null, sort = null): Promise<DepartmentModel> {
        return super.getItems(pageInfo, filter, sort).then((res: DepartmentModel) => {
            const newPageInfo = this.plainToClassEx(DepartmentModel, DepartmentItem, res);
            return Promise.resolve(newPageInfo);
        });
    }

    save(id: number, department): Promise<any> {
        if (id) {
            return this.putById(id, department, true, false);
        } else {
            return this.post('', department, true, false);
        }
    }

    getItem(id: number): Promise<DepartmentItem> {
        return super.getItem(id).then((response: any) => {
            let department: any;
            department = plainToClass<DepartmentItem, {}>(DepartmentItem, response);
            return Promise.resolve(department);
        })
        .catch(error => {
            return Promise.reject(error);
        });
    }

    reset(): void {
        this.resetErrors();
    }
}
