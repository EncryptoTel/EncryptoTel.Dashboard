import {Component, OnInit, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {HeaderComponent} from '../../elements/pbx-header/pbx-header.component';
import {KnowledgeBaseService} from "../../services/knowledge-base.service";
import {HelpGroupItem, HelpGroupModel, HelpItem, HelpModel} from "../../models/knowledge-base.model";
import {ButtonItem, FilterItem} from "../../models/base.model";
import { ThrowStmt } from '../../../node_modules/@angular/compiler';

@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [KnowledgeBaseService],
    animations: [SwipeAnimation('x', '300ms')]
})

export class KnowledgeBaseComponent implements OnInit {
    loading: number;
    helpGroups: HelpGroupModel;
    leftGroups: HelpGroupItem[];
    rightGroups: HelpGroupItem[];
    helps: HelpModel;
    buttons: ButtonItem[];
    filters: FilterItem[];
    currentFilter: any;
    selectedGroup: HelpGroupItem;
    selectedHelp: HelpItem;
    lastIndex: number;

    @ViewChild(HeaderComponent) header: HeaderComponent;

    // -- component lifecycle methods -----------------------------------------

    constructor(private service: KnowledgeBaseService) {
        this.helpGroups = new HelpGroupModel();
        this.leftGroups = [];
        this.rightGroups = [];

        this.helps = new HelpModel();

        this.loading = 0;
        
        this.filters = [];
        this.resetFilter();

        this.buttons = [];
        this.buttons.push({
            id: 0,
            title: 'Back',
            type: 'cancel',
            visible: false,
            inactive: false
        });
    }

    ngOnInit() {
        this.getGroups();
    }

    // -- filter methods ------------------------------------------------------

    get hasFilter(): boolean {
        return !!this.currentFilter && (!!this.currentFilter['group'] || !!this.currentFilter['search']);
    }

    get filterEmptyResult(): boolean {
        return this.helps.items.length == 0 && this.hasFilter;
    }

    resetFilter(): void {
        this.currentFilter = { group: null, search: null };
    }

    // -- event handlers ------------------------------------------------------

    back() {
        this.selectedGroup = null;
        this.selectedHelp = null;
        this.resetFilter();
        this.buttons[0].visible = false;
        this.helps.items = [];
        this.header.updateFilter(0, this.filters);
    }

    showQuestions(item: HelpGroupItem){
        this.selectedGroup = item;
        this.currentFilter['group'] = item.id;
        this.header.updateFilter(0, {id: item.id, title: item.title});
        this.getHelps();
        this.buttons[0].visible = true;
    }

    showAnswer(index) {
        if (this.selectedHelp === this.helps.items[index]) {
            this.selectedHelp = this.helps.items[index];
            this.helps.items[index].open = !this.helps.items[index].open;
        } else {
            this.selectedHelp = this.helps.items[index];
            this.helps.items[index].open = true;
            if (this.lastIndex === 0 || this.lastIndex > 0) {
                this.helps.items[this.lastIndex].open = false;
            }
        }
        this.lastIndex = index;
    }

    reloadFilter(filter) {
        this.currentFilter = filter;
        let item = this.helpGroups.items.find(item => item.id === filter['group']);
        if (item) {
            this.showQuestions(item);
        } else {
            this.noResult();
            // this.getHelps();
        }
    }

    // -- common methods ------------------------------------------------------

    noResult(): void {
        this.selectedGroup = null;
        this.selectedHelp = null;
        this.helps.items = [];
    }

    // -- data retrieval methods ----------------------------------------------

    getHelps(): void {
        this.loading ++;
        this.service.getHelps(this.helps, this.currentFilter).then(response => {
            this.helps = response;
        }).catch(() => {})
          .then(() => this.loading --);
    }

    getGroups(): void {
        this.loading ++;
        this.service.getGroups(this.helpGroups, '').then(response => {
            this.helpGroups = response;
            
            this.leftGroups = [];
            this.rightGroups = [];
            const options = [];

            response.items.forEach((item, index) => {
                options.push({ id: item.id, title: item.title });
                if (index % 2 === 0) this.leftGroups.push(item);
                else this.rightGroups.push(item);
            });

            if (this.filters.length === 0) {
                this.filters.push(new FilterItem(1, 'group', 'Source', options, 'title', '[choose one]'));
                this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search Pbx support', 404));
            } else {
                this.filters[0].options = options;
            }
        }).catch(() => {})
          .then(() => this.loading --);
    }
}
