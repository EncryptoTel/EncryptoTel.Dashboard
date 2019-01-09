import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ClipboardService } from 'ngx-clipboard';
import * as WAValidator from 'wallet-address-validator';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { TranslateService } from '@ngx-translate/core';

import { RefillServices } from '@services/refill.services';
import { LocalStorageServices } from '@services/local-storage.services';
import { MessageServices } from '@services/message.services';
import { CanFormComponentDeactivate } from '@services/can-deactivate-form-guard.service';
import { FadeAnimation } from '@shared/fade-animation';
import { numberRegExp } from '@shared/vars';
import { RefillModel } from '@models/refill.model';
import { PaymentModel } from '@models/payment.model';
import { CoursesModel } from '@models/courses.model';
import { FilterItem } from '@models/base.model';
import {ModalEx} from '@elements/pbx-modal/pbx-modal.component';
import {HeaderComponent} from '@elements/pbx-header/pbx-header.component';


declare var require: any;

@Component({
    selector: 'refill-balance',
    templateUrl: './template.html',
    animations: [FadeAnimation('300ms')],
    providers: [RefillServices, ClipboardService],
    styleUrls: ['./local.sass']
})
export class RefillBalanceComponent implements OnInit, OnDestroy, CanFormComponentDeactivate {

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
    modalExit: ModalEx = new ModalEx('', 'cancelEdit');

    @ViewChild(HeaderComponent) header: HeaderComponent;

    constructor(
        private _refill: RefillServices,
        private _storage: LocalStorageServices,
        private _message: MessageServices,
        private clipboard: ClipboardService,
        private _router: Router,
        protected translate: TranslateService,
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

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.refill_status !== 'paying') return true;

        return Observable.create((observer: Observer<boolean>) => {
            this.showExitModal(
                true,
                () => {
                    observer.next(true);
                    observer.complete();
                },
                () => {
                    observer.next(false);
                    observer.complete();
                });
        });
    }

    showExitModal(editMode: boolean, confirmCallback?: () => void, cancelCallback?: () => void): void {
        const message = (editMode)
            ? this.translate.instant('You have made changes. Do you really want to leave without saving?')
            : this.translate.instant('Do you really want to leave without saving?');
        this.modalExit.setMessage(message);
        this.modalExit.confirmCallback = confirmCallback;
        this.modalExit.cancelCallback = cancelCallback;
        this.modalExit.show();
    }

    resetFilters(): void {
        this.currentFilter = { amount: 5, returnAddress: null };
        if (this.header) this.header.currentFilter = this.currentFilter;
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
                    this.currentFilter['returnAddress'] = this.payment.address;
                    this.filters[1].hidden = !this.selected.needReturnAddress;
                    if (this.header) this.header.currentFilter = this.currentFilter;
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
            this.errors = { amount: this.translate.instant(this.amountValidationError) };
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
                this.errors['returnAddress'] = this.translate.instant('Invalid address');
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
        this.errors = {};
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
            .then(response => {
                this.payment = response;
                this.refill_status = 'processing';
                // this.payment.loading = false;
                this.loading.body = false;
            })
            .catch(error => {
                console.log('errors', error);
                this.errors = error.errors;
                // this.payment.loading = false;
                this.loading.body = false;
            });
    }

    getRefillMethods() {
        this._refill.getRefillMethods()
            .then(response => {
                this.refillMethods = response;
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
