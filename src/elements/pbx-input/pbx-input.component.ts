import {Component, Input, OnInit} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
    selector: 'pbx-input',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class InputComponent implements OnInit {
    @Input() key: string;
    @Input() name: string;
    @Input() description: string;
    @Input() inputClass: string;
    @Input() type: string;
    @Input() placeholder: string;
    @Input() object: any;
    @Input() errors: any;

    value;

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
        this.object[this.key] = $event.target.value;
    }

    ngOnInit() {
        this.value = this.object[this.key];
    }

}
