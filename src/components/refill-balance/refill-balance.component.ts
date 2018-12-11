import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FadeAnimation } from '../../shared/fade-animation';
import { RefillServices } from '../../services/refill.services';
import { RefillModel } from '../../models/refill.model';
import { PaymentModel } from '../../models/payment.model';
import { CoursesModel } from '../../models/courses.model';
import { LocalStorageServices } from '../../services/local-storage.services';
import { MessageServices } from '../../services/message.services';
import { ClipboardService } from 'ngx-clipboard';
import { FilterItem } from '../../models/base.model';
import { numberRegExp } from '../../shared/vars';
import * as WAValidator from 'wallet-address-validator';
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
        body: boolean;
        sidebar: boolean;
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

    constructor(
        private _refill: RefillServices,
        private _storage: LocalStorageServices,
        private _message: MessageServices,
        private clipboard: ClipboardService,
        private _router: Router
    ) {
        this.filters.push(
            new FilterItem(
                1,
                'amount',
                `Payment amount`,
                null,
                null,
                ``,
                150,
                false,
                true,
                'amount',
                `$${this.amount.min}`,
                `$${this.amount.max}`,
                true,
                `5`
            )
        );
        this.filters.push(
            new FilterItem(
                2,
                'returnAddress',
                'Return address',
                null,
                null,
                '',
                220,
                true
            )
        );

        this.navigationSubscription = this._router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.ngOnInit();
            }
        });

        this.amountValidationError = `Please enter value between ${
            this.amount.min
            } and ${this.amount.max}`;
    }

    resetFilters(): void {
        this.currentFilter = { amount: 5, returnAddress: null };
    }

    selectRefillMethod(refillMethod: RefillModel): void {
        if (this.refillMethods.find(m => m.loading)) return;

        if (this.validateFilters()) {
            refillMethod.loading = true;
            this._refill
                .getRefillMethod(refillMethod.id, this.currentFilter['amount'])
                .then(res => {
                    refillMethod.loading = false;
                    this.refill_status = 'paying';
                    this.selected = refillMethod;
                    this.payment = res;
                    console.log('payment', this.payment);
                    this.currentFilter['returnAddress'] = this.payment.address;
                    this.filters[1].hidden = !this.selected.needReturnAddress;
                });
        }
    }

    validateFilters(): boolean {
        const validAmmount = this.validateAmount(this.currentFilter['amount']);
        const validWallet = this.ValidateWallet(this.currentFilter['returnAddress']);
        return validAmmount && validWallet;
    }

    validateAmount(text: string = '5'): boolean {
        this.validInput = numberRegExp.test(text);
        if (this.validInput) {
            if (parseInt(text, 10)) {
                this.currentFilter['amount'] = parseInt(text, 10);
                this.validInput =
                    this.amount.min <= this.currentFilter['amount'] &&
                    this.currentFilter['amount'] <= this.amount.max;
            } else {
                this.validInput = false;
            }
        }
        if ((this.validInput === false)) {
            this.errors = { amount: this.amountValidationError };
            return false;
        } else {
            if (this.errors && 'amount' in this.errors) {
                delete this.errors.amount;
            }
            return true;
        }
    }

    ValidateWallet(text: string) {
        if (text) {
            const coinType = this.selected ? this.selected.currency.code : '';
            const res = WAValidator.validate(text, coinType);
            if (res) {
                delete this.errors.returnAddress;
                return true;
            } else {
                this.errors['returnAddress'] = 'Invalid address';
                return false;
            }
        } else {
            if (this.errors && 'returnAddress' in this.errors) {
                delete this.errors.returnAddress;
            }
            return true;
        }
    }

    cancelPay(): void {
        this.resetFilters();
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
        this._refill
            .setRefillMethod(
                this.selected.id,
                this.currentFilter['amount'],
                this.currentFilter['returnAddress']
            )
            .then(res => {
                this.payment = res;
                this.refill_status = 'processing';
                // this.payment.loading = false;
                this.loading.body = false;
            })
            .catch(res => {
                console.log('errors', res);
                this.errors = res.errors;
                // this.payment.loading = false;
                this.loading.body = false;
            });
    }

    getRefillMethods() {
        this._refill.getRefillMethods().then(res => {
            this.refillMethods = res;
            this.loading.body = false;
        });
    }

    getCourses() {
        this._refill.getCourses().then(res => {
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
        this.validateFilters();
    }

    ngOnInit(): void {
        this.refill_status = 'main';
        this.filters[1].hidden = true;
        this.validInput = true;
        this.loading = { body: true, sidebar: true };
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
