import {BaseService} from "./base.service";
import {PageInfoModel} from "../models/base.model";
import {DepartmentItem, DepartmentModel} from "../models/department.model";
import { plainToClass } from "../../node_modules/class-transformer";

export class DepartmentService extends BaseService {

    onInit() {
        this.url = 'department';
    }

    getItems(pageInfo: PageInfoModel, filter = null): Promise<DepartmentModel> {
        return super.getItems(pageInfo, filter).then((res: DepartmentModel) => {
            let pageInfo = this.plainToClassEx(DepartmentModel, DepartmentItem, res);
            return Promise.resolve(pageInfo);
        });
    }

    save(id: number, department): Promise<any> {
        if (id) {
            return this.putById(id, department);
        } else {
            return this.post('', department);
        }
    }

    getItem(id: number): Promise<DepartmentItem> {
        return super.getItem(id).then((response: any) => {
            let department = plainToClass<DepartmentItem, {}>(DepartmentItem, response);
            return Promise.resolve(department);
        })
        .catch(error => {
            console.log('DepartmentService.getItem', id, error);
            return Promise.reject(error);
        });
    }

    // --- ... ---

    public editMode: boolean = false;
    
    reset(): void {
        this.resetErrors();
    }
}
