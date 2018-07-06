import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {CallDetailItem, CallDetailModel, DashboardModel} from "../models/dashboard.model";
import {plainToClass} from 'class-transformer';
import {dateComparison} from '../shared/shared.functions';
import {WsServices} from "./ws.services";

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
        return this.req.get('v1/dashboard', true).then(res => {
            this.dashboard = res;
            this.ws.balance.balance = res.balance.value;
            const list = plainToClass(CallDetailItem, res['callDetail']);
            const dates: string[] = [];
            list.forEach(item => {
                const date = new Date(item.callDate);
                const dateObj = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('.');
                if (dates.indexOf(dateObj) === -1) {
                    dates.push(dateObj);
                } else {
                    return;
                }
            });
            this.dashboard.callDetail = [];
            dates.forEach(date => {
                this.dashboard.callDetail.push(plainToClass(CallDetailModel, {
                    date: new Date(date),
                    list: []
                }));
            });
            list.map(item => {
                this.dashboard.callDetail.find(historyItem => {
                    return dateComparison(historyItem.date, new Date(item.callDate));
                }).list.push(plainToClass(CallDetailItem, item));
            });
            // this._storage.writeItem('pbx_history', this.history);
            // this.touchHistory();
            return Promise.resolve(this.dashboard);
        });
    }

}
