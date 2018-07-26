import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'options-add-extension-component',
    templateUrl: './template.html',
    styleUrls: ['./../local.sass']
})

export class OptionsAddExtensionComponent implements OnInit {
    @Input() form: any;
    @ViewChildren('label') labelFields;

    constructor() {

    }

    changeCheckbox(text: string): void {
        this.form.get(text).setValue(!this.form.get(text).value);
    }

    ngOnInit(): void {

    }
}
