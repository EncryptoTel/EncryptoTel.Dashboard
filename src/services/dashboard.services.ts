import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {
    CallDetailItem,
    CallDetailModel,
    DashboardModel,
    StorageModel,
    TariffPlanModel
} from '../models/dashboard.model';
import {plainToClass} from 'class-transformer';
import {dateComparison, formatDate, stringToDate} from '../shared/shared.functions';
import {WsServices} from './ws.services';
import * as moment from 'moment';
import {formatDateTime} from '@shared/shared.functions';
import {LocalStorageServices} from '@services/local-storage.services';

@Injectable()
export class DashboardServices {
    dateFormat: any;
    dashboard: DashboardModel;

    constructor(private req: RequestServices,
                private ws: WsServices,
                private storage: LocalStorageServices) {
        this.dateFormat = this.storage.readItem('dateFormat');
    }

    // getDashboard(): Promise<any> {
    //     return this._req.get(`v1/dashboard`, true);
    // }

    getDashboard(): Promise<DashboardModel> {
        return this.req.get('v1/dashboard').then((res: DashboardModel) => {
            this.dashboard = plainToClass(DashboardModel, res);
            this.dashboard.storage = plainToClass(StorageModel, res['storage']);
            this.dashboard.tariffPlan = plainToClass(TariffPlanModel, res['tariffPlan']);
            this.ws.balance.balance = res.balance.value;
            const list = plainToClass(CallDetailItem, res['callDetail']);
            const dates: string[] = [];
            if (list) {
                list.forEach(item => {
                    item.callDate = formatDateTime(item.callDate, this.dateFormat.toUpperCase().replace('HH:MM:SS', 'HH:mm:ss'));
                    const date = item.callDate;
                    const dateObj = date;
                    if (dates.indexOf(dateObj) === -1) {
                        dates.push(dateObj);
                    } else {
                        return;
                    }
                });
            }
            if (this.dashboard.callDetail) {
                this.dashboard.callDetail = [];
                dates.forEach(date => {
                    this.dashboard.callDetail.push(plainToClass(CallDetailModel, {
                        date: date,
                        list: []
                    }));
                });
            }
            if (list) {
                list.forEach(listItem => {
                    this.dashboard.callDetail.forEach(callDetail => {
                        if (listItem.callDate === callDetail.date) {
                            let callDetailItem: any;
                            callDetailItem = new CallDetailItem();
                            callDetailItem.callDate = listItem.callDate;
                            callDetailItem.direction = listItem.direction;
                            callDetailItem.source = listItem.source;
                            callDetailItem.destination = listItem.destination;
                            callDetailItem.duration = listItem.duration;
                            callDetailItem.status = listItem.status;
                            callDetailItem.isSms = listItem.isSms;
                            callDetailItem.name = listItem.name;
                            callDetailItem.tag = listItem.tag;
                            callDetail.list.push(callDetailItem);
                        }
                    });
                });
            }
            return Promise.resolve(this.dashboard);
        });
    }

}
