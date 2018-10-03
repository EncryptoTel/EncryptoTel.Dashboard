import {Component, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {DatePipe} from '@angular/common';
import {FadeAnimation} from '../../shared/fade-animation';
import {PlayerAnimation} from '../../shared/player-animation';
import {CdrService} from '../../services/cdr.service';
import {WsServices} from '../../services/ws.services';
import {CdrItem, CdrModel} from '../../models/cdr.model';
import {getInterval, getDateRange} from '../../shared/shared.functions';
import {TableInfoAction, TableInfoActionOption, TableInfoExModel, TableInfoItem, TagModel} from '../../models/base.model';
import {MediaTableComponent} from '../../elements/pbx-media-table/pbx-media-table.component';
import {TagSelectorComponent} from '../../elements/pbx-tag-selector/pbx-tag-selector.component';


@Component({
    selector: 'pbx-details-and-records',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        FadeAnimation('200ms'),
        PlayerAnimation
    ]
})
export class DetailsAndRecordsComponent implements OnInit {
    pageInfo: CdrModel = new CdrModel();
    cdrSubscription: Subscription;
    table: TableInfoExModel = new TableInfoExModel();

    tags: TagModel[];

    startDate: string;
    endDate: string;


    @ViewChild('mediaTable') mediaTable: MediaTableComponent;
    @ViewChild('tagSelector') tagSelector: TagSelectorComponent;

    // -- component lifecycle methods -----------------------------------------

    constructor(private service: CdrService,
                private ws: WsServices) {

        this.table.sort.isDown = true;
        this.table.sort.column = 'callDate';
        this.table.items.push(new TableInfoItem('From', 'source', 'source'));
        this.table.items.push(new TableInfoItem('To', 'destination', 'destination'));
        this.table.items.push(new TableInfoItem('Date', 'displayDateTime', 'callDate'));
        this.table.items.push(new TableInfoItem('Duration', 'displayDuration'));
        this.table.items.push(new TableInfoItem('Tag', 'displayStatus', 'status'));
        this.table.items.push(new TableInfoItem('Price', 'displayPrice'));
        this.table.items.push(new TableInfoItem('Record', 'record', null, 200, 0));
        this.table.actions.push(new TableInfoAction(1, 'player', 175));
        this.table.actions.push(new TableInfoAction(2, 'drop-down', 25));

        this.cdrSubscription = this.ws.subCdr().subscribe(() => {
            let item = new CdrItem();
            this.pageInfo.items.unshift(item);
            this.getItems(item);
        });

        this.startDate = undefined;
        this.endDate = undefined;

        this.tags = [
            { key: 'noAnswer', title: 'no-answer', selected: false },
            { key: 'incoming', title: 'incoming', selected: true },
            { key: 'outgoing', title: 'outgoing', selected: true },
            { key: 'missed', title: 'missed', selected: false },
            { key: 'record', title: 'record', selected: false },
        ];
    }

    ngOnInit() {
        this.pageInfo.limit = Math.floor((window.innerHeight - 180) / 48);
        this.getItems();
    }

    // -- event handlers ------------------------------------------------------

    getInterval(): string {
        return getInterval(this.pageInfo.items, 'created', 'displayDate');
    }

    getDateRange(): string[] {
        let range = getDateRange(this.pageInfo.items, 'created');

        if (!range[0] || !range[1]) {
            const today = new Date();
            if (!range[0]) range[0] = new Date(today.getFullYear(), 0, 1);
            if (!range[1]) range[1] = today;
        }

        return [ this.formatDate(range[0]), this.formatDate(range[1]) ];
    }

    formatDate(value: Date): string {
        let formatPipe = new DatePipe('en-US');
        return formatPipe.transform(value, 'yyyy-MM-dd');
    }

    dateChanged(range: string[]): void {

        let dateArray: any;
        dateArray = range[0].split('/');
        this.startDate = dateArray[2] + '-' + dateArray[1]+'-'+dateArray[0];

        dateArray = range[1].split('/');
        this.endDate = dateArray[2] + '-' + dateArray[1]+'-'+dateArray[0];

        this.getItems();
    }

    dropDown(event) {
        switch (event.action.id) {
            case 2:
                event.action.options = [];
                if (event.item.playable) event.action.options.push(new TableInfoActionOption(1, 'Download file'));
                if (event.item.contactId) event.action.options.push(new TableInfoActionOption(2, 'View contact'));
                event.action.options.push(new TableInfoActionOption(3, 'Block user', 'ban'));
                break;
        }
    }

    dropDownClick(event) {
        switch (event.action.id) {
            case 2:
                switch (event.option.id) {
                    case 1:
                        console.log('Download file');
                        break;
                    case 2:
                        console.log('View contact');
                        break;
                    case 3:
                        console.log('Block user');
                        break;
                }
                break;
        }
    }

    onTagSelection(): void {
        this.getItems();
    }

    // -- data retrieval methods ----------------------------------------------

    private getItems(item = null): void {
        (item ? item : this).loading ++;
        let tags = this.tagSelector.selectedTags.map(t => {
            return t.key;
        });
        this.service.getItems(this.pageInfo, {status: tags.length > 0 ? tags : null, startDate: this.startDate, endDate: this.endDate}, this.table.sort).then(result => {
            this.pageInfo = result;
            (item ? item : this).loading --;
        }).catch(() => {
            (item ? item : this).loading --;
        });
    }

    getMediaData(item: CdrItem): void {
        item.record.mediaLoading = true;

        this.service.getMediaData(item.accountFile.id)
            .then(result => {
                item.record.mediaStream = result.fileLink;
                this.mediaTable.setMediaData(item);
            })
            .catch(error => {
                console.log(error);
                item.record.mediaLoading = false;
                item.record.playable = false;
            });
    }
}
