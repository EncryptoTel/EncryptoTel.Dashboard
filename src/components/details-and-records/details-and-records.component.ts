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
import {TableInfoAction, TableInfoActionOption, TableInfoExModel, TableInfoItem} from "../../models/base.model";

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
    loading = 0;
    cdrSubscription: Subscription;
    table: TableInfoExModel = new TableInfoExModel();

    dropDirection: string = 'bottom';

    player: any;

    @ViewChild(VgHLS) vgHls: VgHLS;
    api: VgAPI;

    selectedDetailIndex: number;

    selectedDetail: any;
    currentMediaStream: string;

    onPlayerReady(api: VgAPI): void {
        this.api = api;
    }

    filters: MediaGridFilter = new MediaGridFilter();

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
        this.table.items.push(new TableInfoItem('Date', 'displayDate', 'callDate'));
        this.table.items.push(new TableInfoItem('Duration', 'displayDuration'));
        this.table.items.push(new TableInfoItem('Tag', 'displayStatus', 'status'));
        this.table.items.push(new TableInfoItem('Price', 'displayPrice'));
        this.table.items.push(new TableInfoItem('Record', 'record', null, 200, 0));
        this.table.actions.push(new TableInfoAction(1, 'player', 175));
        this.table.actions.push(new TableInfoAction(2, 'drop-down', 25));

        this.filters.dataUpdateRequired.subscribe(event => {
            // console.log('dataUpdateRequired');
            this.getItems();
        });

        this.cdrSubscription = this.ws.subCdr().subscribe(() => {
            let item = new CdrItem();
            this.pageInfo.items.unshift(item);
            this.getItems(item);
        });

        this.getItems();

        this.filters.setTags([
            {key: 'noAnswer', title: 'no-answer'},
            {key: 'incoming', title: 'incoming'},
            {key: 'outgoing', title: 'outgoing'},
            {key: 'missed', title: 'missed'},
            {key: 'record', title: 'record'},
        ]);
    }

    getInterval() {
        let max = null;
        let min = null;
        if (this.pageInfo) {
            for (let i in this.pageInfo.items) {
                let item = this.pageInfo.items[i];
                min = !min || item.created < min.created ? item : min;
                max = !max || item.created > max.created ? item : max;
            }
        }
        return max && min ? `${min.date} - ${max.date}` : '';
    }

    dropDown(event) {
        // console.log(event.action.id);
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
        // console.log(event.action.id);
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

    /* ------------------------------------------------------
     * Details & Records data retirieval
     * ------------------------------------------------------
     */

    private getItems(item = null): void {
        // console.log('getItems');
        (item ? item : this).loading++;
        let tags = this.filters.selectedTags.map(t => {
            return t.key;
        });
        this.service.getItems(this.pageInfo, {status: tags.length > 0 ? tags : null}, this.table.sort).then(result => {
            this.pageInfo = result;
            this.selectedDetailIndex = -1;
            (item ? item : this).loading--;
        }).catch(() => {
            (item ? item : this).loading--;
        });
    }

    ngOnInit() {

    }

    /* ------------------------------------------------------
     * Media player
     * ------------------------------------------------------
     */

    startMediaPlaying(detail: any, forceSeekTime: boolean = false): void {
        if (!detail.playable) return;

        if (forceSeekTime) this.api.seekTime(detail.player.playTime, false);
        this.api.play();
        detail.player.playing = true;
    }

    stopMediaPlaying(detail: any): void {
        if (!detail.playable) return;

        this.api.pause();
        detail.player.playTime = this.api.currentTime;
        detail.player.playing = false;
    }

    playerClick(item) {
        if (!item.playable) return;

        if (item == this.selectedDetail) {
            // toggle current media stream playing
            if (item.player.playing) {
                this.stopMediaPlaying(item);
            }
            else {
                this.startMediaPlaying(item);
            }
        }
        else {
            if (this.selectedDetail && this.selectedDetail.player.playing) {
                // save current media playtime
                this.stopMediaPlaying(this.selectedDetail);
            }

            this.selectedDetail = item;
            if (!item.mediaStream) {
                // load selected detail media data
                this.loadRecordMedia();
            }
            else {
                // switch to selected detail media stream
                this.startPlayRecord();
            }
        }
    }

    startPlayRecord(): void {
        this.selectedDetail.mediaLoading = true;
        let timer: Subscription = TimerObservable.create(0, 10).subscribe(() => {
            this.currentMediaStream = this.selectedDetail.mediaStream;
            timer.unsubscribe();

            let onCanPlay = this.api.getDefaultMedia().subscriptions.canPlay.subscribe(() => {
                onCanPlay.unsubscribe();

                this.startMediaPlaying(this.selectedDetail, true);
                this.selectedDetail.mediaLoading = false;
            });
        });
    }

    loadRecordMedia(): void {
        this.selectedDetail.mediaLoading = true;
        this.service.getRecordMedia(this.selectedDetail.accountFile.id).then(result => {
            this.selectedDetail.mediaStream = result.fileLink;
            this.startPlayRecord();
        }).catch(() => {
        });
    }

    // method is deprecated, but kept for knowledge base
    // convertMediaDataToBlob(base64data: string): string {
    //     // const dataURI = 'data:audio/x-mp3;base64,' + base64data;
    //     const mimeType = 'audio/x-mp3';
    //
    //     const byteString = atob(base64data);
    //     const ab = new ArrayBuffer(byteString.length);
    //     const ia = new Uint8Array(ab);
    //     for (let i = 0; i < byteString.length; i++) {
    //         ia[i] = byteString.charCodeAt(i);
    //     }
    //     const blob = new Blob([ab], {type: mimeType});
    //     const blobUrl = window.URL.createObjectURL(blob);
    //
    //     return blobUrl;
    // }

}

@Pipe({
    name: 'tp'
})
export class TimePipe implements PipeTransform {

    transform(value: any): string {
        const sec_num = parseInt(value, 10);
        const hours = Math.floor(sec_num / 3600) % 24;
        const minutes = Math.floor(sec_num / 60) % 60;
        const seconds = sec_num % 60;
        return [hours, minutes, seconds]
            .map(v => v < 10 ? '0' + v : v)
            .filter((v, i) => v !== '00 ' || i > 0)
            .join(':');
    }

}
