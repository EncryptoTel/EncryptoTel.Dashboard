import {BaseService} from "./base.service";
import {CompanyModel} from "../models/company.model";
import {plainToClass} from "class-transformer";

export class CompanyService extends BaseService {

    save(formData, showSucess = true): Promise<any> {
        return this.post('', formData, showSucess);
    }

    getCompany(): Promise<CompanyModel> {
        return this.get().then((result: CompanyModel) => {
            let company = plainToClass(CompanyModel, result);
            return Promise.resolve(company);
        });
    }

    onInit() {
        this.url = 'v1/company';
    }
}
