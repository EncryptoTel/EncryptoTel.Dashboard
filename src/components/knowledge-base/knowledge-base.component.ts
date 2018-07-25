import {Component, OnInit} from '@angular/core';
import {PartnerProgramService} from '../../services/partner-program.service';
import {PartnerProgramModel} from '../../models/partner-program.model';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {PageInfoModel} from '../../models/base.model';

@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PartnerProgramService],
    animations: [SwipeAnimation('x', '300ms')]
})

export class KnowledgeBaseComponent implements OnInit {

    constructor(private service: PartnerProgramService) {

    }


    ngOnInit(): void {

    }

}
