import {Component, Input} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
    selector: 'pbx-input',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class InputComponent {
    @Input() key: string;
    @Input() name: string;
    @Input() description: string;
    @Input() inputClass: string;
    @Input() type: string;
    @Input() placeholder: string;
    @Input() value: any;
    @Input() errors: any;

    constructor() {
        if (!this.type) this.type = 'text';
        if (!this.placeholder) this.placeholder = '';
        if (!this.inputClass) this.inputClass = '';
    }

    checkError(): string {
        if (!this.errors) {
            return null;
        }
        return this.errors && this.errors[this.key];
    }

    onKeyUp($event) {
        if (this.checkError()) {
            this.errors[this.key] = null;
        }
        this.value[this.key] = $event.target.value;
    }

}
