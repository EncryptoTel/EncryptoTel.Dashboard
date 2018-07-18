import {BaseService} from "./base.service";
import {CompanyModel} from "../models/company.model";
import {plainToClass} from "class-transformer";

export class CompanyService extends BaseService {

    save(formData): Promise<any> {
        return this.post('', formData);
    }

    getCompany(): Promise<CompanyModel> {
        return this.get('').then((res: CompanyModel) => {
            let company = plainToClass(CompanyModel, res);
            return Promise.resolve(company);
        });
    }

    onInit() {
        this.url = 'v1/company';
    }
}
