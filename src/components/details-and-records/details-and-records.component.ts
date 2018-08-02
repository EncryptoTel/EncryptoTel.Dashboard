import {Component, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {VgAPI} from 'videogular2/core';
import {VgHLS} from 'videogular2/src/streaming/vg-hls/vg-hls';
import {FadeAnimation} from '../../shared/fade-animation';
import {PlayerAnimation} from '../../shared/player-animation';
import {CdrService} from '../../services/cdr.service';
import {MediaGridFilter} from '../../models/media-grid.model';
import {WsServices} from "../../services/ws.services";
import {CdrItem, CdrModel} from "../../models/cdr.model";
import {getInterval} from "../../shared/shared.functions";
import {TableInfoAction, TableInfoActionOption, TableInfoExModel, TableInfoItem, TagModel} from "../../models/base.model";
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
    loading: number = 0;
    cdrSubscription: Subscription;
    table: TableInfoExModel = new TableInfoExModel();

    tags: TagModel[];

    @ViewChild('mediaTable') mediaTable: MediaTableComponent;
    @ViewChild('tagSelector') tagSelector: TagSelectorComponent;

    /* ------------------------------------------------------
     * Component initialization
     * ------------------------------------------------------
     */

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

        this.tags = [
            {key: 'noAnswer', title: 'no-answer'},
            {key: 'incoming', title: 'incoming'},
            {key: 'outgoing', title: 'outgoing'},
            {key: 'missed', title: 'missed'},
            {key: 'record', title: 'record'},
        ];
    }

    ngOnInit() {
        this.pageInfo.limit = Math.floor((window.innerHeight - 180) / 48);
        this.getItems();
    }

    getInterval() {
        return getInterval(this.pageInfo.items, 'created', 'displayDate');
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

    /* ------------------------------------------------------
     * Details & Records data retirieval
     * ------------------------------------------------------
     */

    private getItems(item = null): void {
        (item ? item : this).loading++;
        let tags = this.tagSelector.selectedTags.map(t => {
            return t.key;
        });
        this.service.getItems(this.pageInfo, {status: tags.length > 0 ? tags : null}, this.table.sort).then(result => {
            this.pageInfo = result;
            (item ? item : this).loading--;
        }).catch(() => {
            (item ? item : this).loading--;
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
