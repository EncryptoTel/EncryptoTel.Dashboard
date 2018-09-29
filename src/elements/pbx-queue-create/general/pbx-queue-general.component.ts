import {Component, Input, OnInit} from '@angular/core';
import {FadeAnimation} from '../../../shared/fade-animation';
import {FormGroup} from '@angular/forms';
import {ValidationHost} from '../../../models/validation-host.model';
import {isDevEnv} from '../../../shared/shared.functions';


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
    @Input()
    set cmpType(cmpType: string) {
        this._cmpType = cmpType;
        this.getNumbers();
    }

    loading: number = 0;
    numbers = [];

    constructor() {}

    ngOnInit(): void {}

    private getNumbers(): void {
        this.loading ++;
        this.service.getOuters().then(response => {
            this.numbers = response;
        }).catch(() => { isDevEnv() && this.mockPhoneNumbers(); })
          .then(() => this.loading --);
    }

    private mockPhoneNumbers(): void {
        this.numbers = [
            { id: 1, phoneNumber: '5553322' },
            { id: 2, phoneNumber: '5553323' }
        ];
    }
}
