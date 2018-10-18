import {Component, Input, OnInit} from '@angular/core';
import {FadeAnimation} from '../../../shared/fade-animation';
import {PartnerProgramModel} from '../../../models/partner-program.model';

@Component({
    selector: 'overview-partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class OverviewPartnerProgramComponent implements OnInit {
    @Input() form: any;
    @Input() partners: PartnerProgramModel;

    loading = {
        tag: true
    };
    tag;

    constructor() {

    }

    setTag(): void {
        this.tag = {active: [], inactive: []};
        this.partners.items.forEach(el => {
            this.tag.active.push({id: el.id, title: el.name, color: Math.round(Math.random() * 5 + 1)});
        });
        this.loading.tag = false;
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
