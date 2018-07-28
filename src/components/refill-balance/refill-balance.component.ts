import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import {FadeAnimation} from '../../shared/fade-animation';
import {RefillServices} from '../../services/refill.services';
import {RefillModel} from '../../models/refill.model';
import {PaymentModel} from '../../models/payment.model';
import {CoursesModel} from '../../models/courses.model';
import {LocalStorageServices} from '../../services/local-storage.services';
import {MessageServices} from '../../services/message.services';
import {ClipboardService} from 'ngx-clipboard';
import {FilterItem} from "../../elements/pbx-header/pbx-header.component";

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
    modal = {
        visible: false,
        title: 'Confirm payment',
        confirm: {type: 'success', value: 'Yes'},
        decline: {type: 'cancel', value: 'No'}
    };
    currentFilter = [];

    navigationSubscription: Subscription;

    constructor(private _refill: RefillServices,
                private _storage: LocalStorageServices,
                private _message: MessageServices,
                private clipboard: ClipboardService,
                private _router: Router) {
        this.filters.push(new FilterItem(1, 'amount',
            `Payment amount:`, null, null,
            `Min $${this.amount.min}, Max $${this.amount.max}`, 150, false, true));
        this.filters.push(new FilterItem(2,  'returnAddress',
            'Return address:', null, null, '', 300, true));

        this.navigationSubscription = this._router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.ngOnInit();
            }
        });
    }
    
    selectRefillMethod(refillMethod: RefillModel) {
        if (this.validValue(this.currentFilter['amount'])) {
            refillMethod.loading = true;
            this._refill.getRefillMethod(refillMethod.id, this.currentFilter['amount']).then(res => {
                refillMethod.loading = false;
                this.refill_status = 'paying';
                this.selected = refillMethod;
                this.payment = res;
                this.currentFilter['returnAddress'] = this.payment.address;
                this.filters[1].hidden = !this.selected.needReturnAddress;
            });
        } else {
            this.errors = {amount: 'Please input correct value'};
        }
    }

    validValue(text) {
        if (parseInt(text, 10)) {
            this.currentFilter['amount'] = parseInt(text, 10);
            return (this.validInput = this.amount.min <= this.currentFilter['amount'] && this.currentFilter['amount'] <= this.amount.max);
        }
        return this.validInput = false;
    }

    keyup(text) {
        if (!this.validInput) {
            this.validValue(text);
        }
    }

    cancelPay(): void {
        this.refill_status = 'main';
        this.selected = null;
        this.errors = null;
        this.filters[1].hidden = true;
    }

    pay(): void {
        this.payment.loading = true;
        this._refill.setRefillMethod(this.selected.id, this.currentFilter['amount'], this.currentFilter['returnAddress']).then(res => {
            this.payment = res;
            this.refill_status = 'processing';
            this.payment.loading = false;
        }).catch(res => {
            this.errors = res.errors;
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

    copyToClipboard() {
        this.clipboard.copyFromContent(this.payment.address);
    }

    reloadFilter(filter) {
        this.currentFilter = filter;
    }

    ngOnInit(): void {
        this.refill_status = 'main';
        this.filters[1].hidden = true;
        this.validInput = true;
        this.loading = {body: true, sidebar: true};
        this.getRefillMethods();
        this.getCourses();
        this.balance = this.getBalance();
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {  
            this.navigationSubscription.unsubscribe();
        }
    }
}
