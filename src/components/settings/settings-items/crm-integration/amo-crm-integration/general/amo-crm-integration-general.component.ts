import {Component, Input, OnInit} from '@angular/core';
import {FadeAnimation} from '../../../../../../shared/fade-animation';
import {PartnerProgramModel} from '../../../../../../models/partner-program.model';

@Component({
    selector: 'amo-crm-integration-general-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class AmoCrmIntegrationGeneralComponent implements OnInit {
    @Input() form: any;
    @Input() partners: PartnerProgramModel;

    loading = {
        tag: true
    };
    tag;
    amoCrmEnable: boolean = false;

    constructor() {

    }

    setTag(): void {
        this.tag = {active: [], inactive: []};
        this.loading.tag = false;
    }
    checkboxClick() {
        this.amoCrmEnable = !this.amoCrmEnable;
    }


    clickActiveTag(item): void {
        this.tag.active.splice(this.tag.active.indexOf(item), 1);
        this.tag.inactive.push(item);
    }

    clickInactiveTag(item): void {
        this.tag.inactive.splice(this.tag.inactive.indexOf(item), 1);
        this.tag.active.push(item);
    }

    ngOnInit(): void {
        this.setTag();
    }

}
