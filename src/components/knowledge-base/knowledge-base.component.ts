import {Component, Input, OnInit} from '@angular/core';
import {PartnerProgramService} from '../../services/partner-program.service';
import {PartnerProgramModel} from '../../models/partner-program.model';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {PageInfoModel} from '../../models/base.model';
import {ButtonItem, FilterItem, HeaderComponent} from '../../elements/pbx-header/pbx-header.component';

@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.less'],
    providers: [PartnerProgramService],
    animations: [SwipeAnimation('x', '300ms')]
})

export class KnowledgeBaseComponent implements OnInit {
    @Input() buttons: ButtonItem[] = [];
    filters: FilterItem[] = [];

    constructor(private service: PartnerProgramService) {
      const filterValue = [
        {id: 'all', title: 'All'},
        {id: 'account', title: 'Account'},
      ];
      this.filters.push(new FilterItem(1, 'type', 'Select Source', filterValue, 'title'));
      this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search Pbx support'));
    }

    reloadFilter(filter) {
      // this.filters = filter;
    }

    updateFilter(filter) {
      this.filters = filter;
    }

    ngOnInit(): void {

    }

}
