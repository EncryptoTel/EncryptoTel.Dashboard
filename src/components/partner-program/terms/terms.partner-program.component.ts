import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'terms-partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})

export class TermsPartnerProgramComponent implements OnInit {
    @Input() form: any;

    constructor() {

    }

    ngOnInit(): void {

    }

}
