import {Component, Input, OnInit, Output} from '@angular/core';
import {FadeAnimation} from '../../../shared/fade-animation';
import {FormGroup} from '@angular/forms';
import {ValidationHost} from '../../../models/validation-host.model';
import {isDevEnv} from '../../../shared/shared.functions';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'pbx-queue-general',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class QueueGeneralComponent implements OnInit {

    @Input() name: string;
    @Input() service: any;
    @Input() form: boolean;
    @Input() object: FormGroup;
    @Input() validationHost: ValidationHost;

    @Input() generalHeaderText: string;

    private _cmpType: string;
    @Input() set cmpType(cmpType: string) {
        this._cmpType = cmpType;
        this.getNumbers();
    }

    loading: number = 0;
    numbers: any[] = [];

    // -- properties ----------------------------------------------------------

    get isCallQueue(): boolean {
        return this.name === 'call-queues';
    }

    get selectedNumber(): any {
        return this.numbers.find(n => n.id === this.object.get('sipId').value);
    }

    get selectedStrategy(): any {
        return this.service.params.strategies.find(s => s.id === this.object.value['strategy']);
    }

    // -- component lifecycle methods -----------------------------------------

    placeholder: any;
    ringTimeDescription: any;
    minMaxDescription: any;
    announcePositionDescription: any;
    announceHoldtimeDescription: any;

    constructor(public translate: TranslateService) {
    }

    ngOnInit(): void {
        this.placeholder = this.translate.instant('[choose one]');
        this.ringTimeDescription = this.translate.instant('seconds (min 15 seconds, max 600 seconds)');
        this.minMaxDescription = this.translate.instant('(min 1, max 100)');
        this.announcePositionDescription = this.translate.instant('Announce Queue position to caller');
        this.announceHoldtimeDescription = this.translate.instant('Announce Holdtime');
    }

    // -- data processing methods ---------------------------------------------

    private getNumbers(): void {
        this.loading ++;
        this.service.getOuters().then(response => {
            response.forEach(item => {
                if (item.providerId && item.providerId !== 1) {
                    item.phoneNumber = '+' + item.phoneNumber;
                }
            });
            this.numbers = response;
        }).catch(() => {})
          .then(() => this.loading --);
    }
}
