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
import {dateComparison, stringToDate} from '../shared/shared.functions';
import {WsServices} from './ws.services';
import * as moment from 'moment';

@Injectable()
export class DashboardServices {

    constructor(private req: RequestServices,
                private ws: WsServices) {
    }

    dashboard: DashboardModel;

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
                    const date = item.callDate.split(' ')[0];
                    const dateObj = date.split('-').join('.');
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
                        date: moment(new Date(date), ['YYYY-MM-DD HH:mm:ss']).format('YYYY-MM-DD HH:mm:ss'),
                        list: []
                    }));
                });
            }
            if (list) {
                list.forEach(listItem => {
                    this.dashboard.callDetail.forEach(callDetail => {

                    });
                });

                // const tmp = list.map((item: CallDetailItem) => {
                //     const callDetail = this.dashboard.callDetail.find(historyItem => {
                //         return dateComparison(historyItem.date, item.callDate);
                //     });
                //     return callDetail.list.push(plainToClass(CallDetailItem, item);
                // });
            }
            return Promise.resolve(this.dashboard);
        });
    }

}
