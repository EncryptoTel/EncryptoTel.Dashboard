import { Injectable, Output, EventEmitter } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class SelectService {
    isOpen = false;

    @Output() change: EventEmitter<boolean> = new EventEmitter();

    open() {
        this.isOpen = true;
        this.change.emit(this.isOpen);
    }

}
