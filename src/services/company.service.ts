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

    uploadFile(file, mode, type = null): Promise<any> {

        const data = new FormData();
        data.append('type', type ? type : 'image');
        data.append('file', file);
        if (mode) {
            data.append('mode', mode);
        }
        return this.rawRequest('POST', '/upload', data).then((company) => {
            return company;
        }).catch(() => {

        });
    }
}
