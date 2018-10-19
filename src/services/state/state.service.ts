import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class StateService {

    state: boolean = false;
    _value: any;

    @Output() change: EventEmitter<boolean> = new EventEmitter();

    set value($value) {
        this._value = $value;
    }

    get value() {
        return this._value;
    }
}
