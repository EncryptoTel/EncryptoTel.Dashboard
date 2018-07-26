import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'rights-add-extension-component',
    templateUrl: './template.html',
    styleUrls: ['./../local.sass']
})

export class RightsAddExtensionComponent implements OnInit {
    @Input() accessList: any;
    @ViewChildren('label') labelFields;

    constructor() {

    }

    ngOnInit(): void {

    }
}
