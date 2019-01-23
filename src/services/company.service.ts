import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { CompanyModel, CompanyInfoModel } from '../models/company.model';
import { plainToClass } from 'class-transformer';
import { RequestServices } from './request.services';
import { MessageServices } from './message.services';
import * as companyInfoMap from '../shared/company-info-map.json';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
export class CompanyService extends BaseService {

  model: CompanyModel;
  companyInfo: CompanyInfoModel;

  constructor(public request: RequestServices,
    public message: MessageServices,
    public http: HttpClient,
    public translate: TranslateService) {
    super(request, message, http, translate);
  }

  onInit(): void {
    this.url = 'company';
    this.companyInfo = plainToClass(CompanyInfoModel, companyInfoMap);
    this.companyInfo.locale = this.translate.currentLang;
  }

  save(formData, showSucess = true): Promise<any> {
    return this.post('', formData, showSucess);
  }

  getCompany(): Promise<CompanyModel> {
    return this.get()
      .then((response: CompanyModel) => {
        const company = plainToClass(CompanyModel, response);
        this.companyInfo.setCompanyData(company);
        console.log('info', this.companyInfo);
        return Promise.resolve(company);
      })
      .catch((error) => {
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
    return this.rawRequest('POST', '/upload', data)
      .then((company) => {
        return company;
      })
      .catch(() => { });
  }
}
