import {Component, OnInit} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {RefillServices} from '../../services/refill.services';
import {RefillModel} from '../../models/refill.model';
import {PaymentModel} from '../../models/payment.model';
import {CoursesModel} from '../../models/courses.model';
import {LocalStorageServices} from '../../services/local-storage.services';
import {MessageServices} from '../../services/message.services';
import {normalizeSlashes} from 'ts-node/dist';

@Component({
    selector: 'refill-balance',
    templateUrl: './template.html',
    animations: [FadeAnimation('300ms')],
    providers: [RefillServices],
    styleUrls: ['./local.sass']
})
export class RefillBalanceComponent implements OnInit {
    refillMethods: RefillModel[];
    courses: CoursesModel[];
    amount = {
        value: null,
        min: 5,
        max: 1000
    };
    loading: {
        body: boolean,
        sidebar: boolean,
    };
    refill_status = 'main'; // main, paying, processing
    selected: RefillModel;
    payment: PaymentModel;
    validInput: boolean;
    returnAddress: string;

    balance;
    modal = {
        visible: false,
        title: 'Confirm payment',
        confirm: {type: 'success', value: 'Yes'},
        decline: {type: 'cancel', value: 'No'}
    };

    constructor(private _refill: RefillServices,
                private _storage: LocalStorageServices,
                private _message: MessageServices) {}

    selectRefillMethod(refillMethod: RefillModel) {
        if (this.validValue(this.amount.value)) {
            refillMethod.loading = true;
            this._refill.getRefillMethod(refillMethod.id, this.amount.value)
                .then(res => {
                    // console.log(res);
                    refillMethod.loading = false;
                    this.refill_status = 'paying';
                    this.selected = refillMethod;
                    this.payment = res;
                    this.returnAddress = this.payment.address;
                });
        } else {
          this._message.writeError('Please input correct value');
        }
    }

    validValue(text) {
        if (parseInt(text, 10)) {
            this.amount.value = parseInt(text, 10);
            return (this.validInput = this.amount.min <= this.amount.value && this.amount.value <= this.amount.max);
        }
        return this.validInput = false;
    }

    keyup(text) {
        if (!this.validInput) {this.validValue(text); }
    }

    cancelPay(): void {
        this.refill_status = 'main';
        this.selected = null;
    }

    pay(): void {
        this.payment.loading = true;
        // console.log('pay');
        this._refill.setRefillMethod(this.selected.id, this.amount.value, this.returnAddress)
            .then(res => {
                this.payment = res;
                this.refill_status = 'processing';
                this.payment.loading = false;
            });
    }

    getRefillMethods() {
        this._refill.getRefillMethods()
            .then(res => {
                this.refillMethods = res;
                this.loading.body = false;
            });
    }

    getCourses() {
        this._refill.getCourses()
            .then(res => {
                this.courses = res;
                this.loading.sidebar = false;
            });
    }

    getBalance() {
        const user = this._storage.readItem('pbx_user');
        return user['balance'];
    }

    ngOnInit(): void {
        this.validInput = true;
        this.loading = {body: true, sidebar: true};
        this.getRefillMethods();
        this.getCourses();
        this.balance = this.getBalance();
    }
}
