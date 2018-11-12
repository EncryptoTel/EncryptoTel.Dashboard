import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {FadeAnimation} from '../../shared/fade-animation';
import {RefillServices} from '../../services/refill.services';
import {RefillModel} from '../../models/refill.model';
import {PaymentModel} from '../../models/payment.model';
import {CoursesModel} from '../../models/courses.model';
import {LocalStorageServices} from '../../services/local-storage.services';
import {MessageServices} from '../../services/message.services';
import {ClipboardService} from 'ngx-clipboard';
import {FilterItem} from '../../models/base.model';
import {numberRegExp} from '../../shared/vars';

declare var require: any;

@Component({
    selector: 'refill-balance',
    templateUrl: './template.html',
    animations: [FadeAnimation('300ms')],
    providers: [RefillServices, ClipboardService],
    styleUrls: ['./local.sass']
})
export class RefillBalanceComponent implements OnInit, OnDestroy {
    refillMethods: RefillModel[];
    courses: CoursesModel[];
    amount = {
        min: 5,
        max: 10000
    };
    amountValidationError: string;
    loading: {
        body: boolean,
        sidebar: boolean,
    };
    refill_status = 'main'; // main, paying, processing
    selected: RefillModel;
    payment: PaymentModel;
    validInput: boolean;
    filters: FilterItem[] = [];
    errors;

    balance;
    currentFilter: any;

    navigationSubscription: Subscription;
    WAValidator: any;

    constructor(private _refill: RefillServices,
                private _storage: LocalStorageServices,
                private _message: MessageServices,
                private clipboard: ClipboardService,
                private _router: Router) {

        this.WAValidator = require('wallet-address-validator');

        this.filters.push(new FilterItem(1, 'amount',
            `Payment amount`, null, null,
            ``, 150, false, true, 'amount', `$${this.amount.min}`, `$${this.amount.max}`, true));
        this.filters.push(new FilterItem(2, 'returnAddress',
            'Return address', null, null, '', 220, true));

        this.navigationSubscription = this._router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.ngOnInit();
            }
        });

        this.amountValidationError = `Please enter value between ${this.amount.min} and ${this.amount.max}`;
    }

    resetFilters(): void {
        this.currentFilter = {amount: null, returnAddress: null};
    }

    selectRefillMethod(refillMethod: RefillModel): void {
        if (this.refillMethods.find(m => m.loading)) return;

        if (this.validateFilters()) {
            refillMethod.loading = true;
            this._refill.getRefillMethod(refillMethod.id, this.currentFilter['amount']).then(res => {
                refillMethod.loading = false;
                this.refill_status = 'paying';
                this.selected = refillMethod;
                this.payment = res;
                console.log('payment', this.payment);
                this.currentFilter['returnAddress'] = this.payment.address;
                this.filters[1].hidden = !this.selected.needReturnAddress;
            });
        } else {
            this.errors = {amount: this.amountValidationError};
        }
    }

    validateFilters(): boolean {
        return this.validateAmount(this.currentFilter['amount']);
    }

    validateAmount(text: string): boolean {
        if (numberRegExp.test(text)) {
            if (parseInt(text, 10)) {
                this.currentFilter['amount'] = parseInt(text, 10);
                return (this.validInput = this.amount.min <= this.currentFilter['amount'] && this.currentFilter['amount'] <= this.amount.max);
            }
        }
        return this.validInput = false;
    }

    cancelPay(): void {
        this.refill_status = 'main';
        this.selected = null;
        this.errors = null;
        this.filters[1].hidden = true;
    }

    pay(): void {

        // let valid: any;
        // valid = this.WAValidator .validate('3PAUeFvWq7WbGqV4VaZ1DH4FQJgbLoz7z2i', 'bitcoin');

        if (!this.validateFilters()) return;

        // this.payment.loading = true;
        this.loading.body = true;
        this._refill.setRefillMethod(this.selected.id, this.currentFilter['amount'], this.currentFilter['returnAddress']).then(res => {
            this.payment = res;
            this.refill_status = 'processing';
            // this.payment.loading = false;
            this.loading.body = false;
        }).catch(res => {
            console.log('errors', res);
            this.errors = res.errors;
            // this.payment.loading = false;
            this.loading.body = false;
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

    copyToClipboard() {
        this.clipboard.copyFromContent(this.payment.address);
    }

    reloadFilter(filter) {
        this.currentFilter = filter;
        if (this.currentFilter['amount'] && !this.validateFilters()) {
            this.errors = {amount: this.amountValidationError};
        }
        else {
            this.errors = {};
        }
    }

    ngOnInit(): void {
        this.refill_status = 'main';
        this.filters[1].hidden = true;
        this.validInput = true;
        this.loading = {body: true, sidebar: true};
        this.getRefillMethods();
        this.getCourses();
        this.balance = this.getBalance();
        this.errors = {};
        this.resetFilters();
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    addLeadingZeros(payment) {
        let sNum: string;
        let len: number = 12;
        len -= String(payment.paymentId).length;
        sNum = payment.paymentId;
        while (len--) {
            sNum = '0' + sNum;
        }
        return payment.paymentPrefix + sNum;
    }

}
