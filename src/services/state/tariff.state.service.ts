import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class TariffStateService {

    used = true;

    @Output() change: EventEmitter<boolean> = new EventEmitter();

    load() {
        this.used = false;
        this.change.emit(this.used);
    }

    unload() {
        this.used = true;
        this.change.emit(this.used);
    }

}
