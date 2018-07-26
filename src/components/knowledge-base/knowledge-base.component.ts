import {Component, OnInit, ViewChild} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {ButtonItem, FilterItem, HeaderComponent} from '../../elements/pbx-header/pbx-header.component';
import {KnowledgeBaseService} from "../../services/knowledge-base.service";
import {HelpGroupItem, HelpGroupModel, HelpItem, HelpModel} from "../../models/knowledge-base.model";

@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [KnowledgeBaseService],
    animations: [SwipeAnimation('x', '300ms')]
})

export class KnowledgeBaseComponent implements OnInit {

    @ViewChild(HeaderComponent) header: HeaderComponent;

    loading = 0;
    helpGroups: HelpGroupModel = new HelpGroupModel();
    leftGroups: HelpGroupItem[] = [];
    rightGroups: HelpGroupItem[] = [];
    helps: HelpModel = new HelpModel();
    buttons: ButtonItem[] = [];
    filters: FilterItem[] = [];
    currentFilter = [];
    visible = [];
    selectedGroup: HelpGroupItem;
    selectedHelp: HelpItem;

    constructor(private service: KnowledgeBaseService) {
        this.buttons.push({
            id: 0,
            title: 'Back',
            type: 'cancel',
            visible: false,
            inactive: false
        });
    }

    back() {
        this.selectedGroup = null;
        this.selectedHelp = null;
        this.buttons[0].visible = false;
        this.helps.items = [];
        this.header.updateFilter(0, null);
    }

    showQuestions(item: HelpGroupItem){
        this.selectedGroup = item;
        this.currentFilter['group'] = item.id;
        this.header.updateFilter(0, {id: item.id, title: item.title});
        this.getHelps();
        this.buttons[0].visible = true;
    }

    showAnswer(item: HelpItem){
        this.selectedHelp = item;
    }

    reloadFilter(filter) {
        this.currentFilter = filter;
        let item = this.helpGroups.items.find(item => item.id === filter['group']);
        if (item) {
            this.showQuestions(item);
        } else {
            this.getHelps();
        }
    }

    getHelps() {
        this.loading++;
        this.service.getHelps(this.helps, this.currentFilter).then(res => {
            this.helps = res;
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }

    getGroups() {
        this.loading++;
        this.service.getGroups(this.helpGroups, '').then(res => {
            this.helpGroups = res;
            this.leftGroups = [];
            this.rightGroups = [];

            for (let i = 0; i < res.items.length; i++) {
                if (i % 2 === 0) {
                    this.leftGroups.push(res.items[i]);
                } else {
                    this.rightGroups.push(res.items[i]);
                }
            }

            const options = [];
            res.items.forEach(item => {
                options.push({id: item.id, title: item.title});
            });
            if (this.filters.length === 0) {
                this.filters.push(new FilterItem(1, 'group', 'Select Source', options, 'title'));
                this.filters.push(new FilterItem(2, 'search', 'Search', null, null, 'Search Pbx support'));
            } else {
                this.filters[0].options = options;
            }
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }

    ngOnInit() {
        this.getGroups();

    }

}