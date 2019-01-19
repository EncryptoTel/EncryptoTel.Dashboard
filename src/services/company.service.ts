import {HttpClient} from '@angular/common/http';
import {BaseService} from './base.service';
import {CompanyModel, CompanyInfoModel, CompanyAddress} from '../models/company.model';
import {plainToClass} from 'class-transformer';
import {isDevEnv} from '../shared/shared.functions';
import {CountryModel} from '../models/country.model';
import {RequestServices} from './request.services';
import {MessageServices} from './message.services';
import * as companyInfoMap from '../shared/company-info-map.json';
import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';


@Injectable()
export class CompanyService extends BaseService {

    public model: CompanyModel;
    public companyInfo: CompanyInfoModel;

    constructor(public request: RequestServices,
                public message: MessageServices,
                public http: HttpClient,
                public translate: TranslateService) {
        super(request, message, http, translate);
    }

    public onInit(): void {
        this.url = 'company';
        this.companyInfo = plainToClass(CompanyInfoModel, companyInfoMap);
        console.log(this.companyInfo);
    }

    public save(formData, showSucess = true): Promise<any> {
        return this.post('', formData, showSucess);
    }

    public getCompany(): Promise<CompanyModel> {
        return this.get()
            .then((response: CompanyModel) => {
                const company = plainToClass(CompanyModel, response);
                this.companyInfo.setCompanyData(company);
                return Promise.resolve(company);
            })
            .catch((error) => {
                // isDevEnv() && this.mockCompanyData();
                return Promise.reject(error);
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

    mockCompanyData(): void {
        this.model = new CompanyModel('Organisation', null, 'stas@co.il', '5553322', 75, []);
        const country = new CountryModel(103, 'AD', 'Andorra', '376');
        this.model.companyAddress.push(new CompanyAddress(country, '332332', 'Regi', 'Loki', 'Ave', '221B', '89'));
        console.log('model', this.model);
    }
}
