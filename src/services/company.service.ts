import {BaseService} from "./base.service";
import {CompanyModel, CompanyInfoModel} from "../models/company.model";
import {plainToClass} from "class-transformer";
import * as companyInfoMap from '../shared/company-info-map.json';

export class CompanyService extends BaseService {
    public companyInfo: CompanyInfoModel;

    public onInit(): void {
        this.url = 'company';
        this.companyInfo = plainToClass(CompanyInfoModel, companyInfoMap);
    }

    public save(formData, showSucess = true): Promise<any> {
        return this.post('', formData, showSucess);
    }

    public getCompany(): Promise<CompanyModel> {
        return this.get().then((response: CompanyModel) => {
            let company = plainToClass(CompanyModel, response);
            // console.log('_company_', company, this.companyInfo);
            this.companyInfo.setCompanyData(company);
            return Promise.resolve(company);
        });
    }
}
