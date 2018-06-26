import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {RefillModel} from '../models/refill.model';
import {PaymentModel} from "../models/payment.model";
import {CoursesModel} from "../models/courses.model";

@Injectable()
export class RefillServices {
    constructor(private _req: RequestServices) {
    }

    getRefillMethods(): Promise<RefillModel[]> {
        return this._req.get('v1/balance/refill', true).then(res => {
            return Promise.resolve(res['refillMethods']);
        }).catch();
    }

    getRefillMethod(id: number, amount: number): Promise<PaymentModel> {
        return this._req.get(`v1/balance/refill/${id}?amount=${amount}`, true).then(res => {
            return Promise.resolve(res['result']);
        }).catch();
    }

    setRefillMethod(id: number, amount: number, returnAddress: string): Promise<PaymentModel> {
        return this._req.post(`v1/balance/refill`, {refillMethodId: id, amount: amount, returnAddress: returnAddress}, true).then(res => {
            return Promise.resolve(res['result']);
        }).catch();
    }

    getCourses(): Promise<CoursesModel[]> {
        return this._req.get('v1/currency/courses', true).then(res => {
            return Promise.resolve(res['courses']);
        }).catch();
    }

}
