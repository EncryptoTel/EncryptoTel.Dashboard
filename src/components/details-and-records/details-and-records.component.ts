import {Component, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {VgAPI} from 'videogular2/core';
import {VgHLS} from 'videogular2/src/streaming/vg-hls/vg-hls';

import {environment} from '../../environments/environment';
import {FadeAnimation} from '../../shared/fade-animation';
import {PlayerAnimation} from '../../shared/player-animation';
import {DetailsAndRecordsServices} from '../../services/details-and-records.services';
// import { LocalStorageServices } from '../../services/local-storage.services';
import {MediaGridColumn, MediaGrid} from '../../models/media-grid.model';
import {WsServices} from "../../services/ws.services";

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
    detailsDataLoading: boolean = false;
    details: any = [];

    rowHowerIndex: number;
    contactActionName: string = 'View contact';
    dropDirection: string = 'bottom';

    // curID: number;
    player: any;
    payerBlob: any;
    playerId: any;
    playerSeek: any;
    playerFiles = [];
    playerPrevState: any;

    @ViewChild(VgHLS) vgHls: VgHLS;
    api: VgAPI;

    selectedDetailIndex: number;

    selectedDetail: any;
    currentMediaStream: string;

    grid: MediaGrid;
    cdrSubscription: Subscription;

    /* ------------------------------------------------------
     * Component initialization
     * ------------------------------------------------------
     */

    constructor(private services: DetailsAndRecordsServices,
                private ws: WsServices) {
        this.cdrSubscription = this.ws.subCdr().subscribe(() => {
            this.getDetailsAndRecords();
        });
        this.grid = new MediaGrid([
            new MediaGridColumn('source', 'From', true),
            new MediaGridColumn('destination', 'To', true),
            new MediaGridColumn('date', 'Date', false),
            new MediaGridColumn('duration', 'Duration'),
            new MediaGridColumn('status', 'Tag', true),
            new MediaGridColumn('price', 'Price', false),
            new MediaGridColumn('record', 'Record', false),
        ]);

        this.grid.dataUpdateRequired.subscribe(event => {
            this.getDetailsAndRecords();
        });

        // TODO: track window.resize
        this.grid.limit = Math.floor((window.innerHeight - 280) / 48);

        this.grid.setFilterTags([
            {key: 'noAnswer', title: 'no-answer'},
            {key: 'incoming', title: 'incoming'},
            {key: 'outgoing', title: 'outgoing'},
            {key: 'missed', title: 'missed'},
            {key: 'record', title: 'record'},
        ]);
    }

    ngOnInit() {
        // sort 1st column by default
        this.grid.sortByIndex(0);
    }

    onPlayerReady(api: VgAPI): void {
        this.api = api;
    }

    /* ------------------------------------------------------
     * Media player
     * ------------------------------------------------------
     */

    startMediaPlaying(detail: any, forceSeekTime: boolean = false): void {
        if (!detail.playable) return;

        if (forceSeekTime) this.api.seekTime(detail.mediaPlayTime, false);
        this.api.play();
        detail.playing = true;
    }

    stopMediaPlaying(detail: any): void {
        if (!detail.playable) return;

        this.api.pause();
        detail.mediaPlayTime = this.api.currentTime;
        detail.playing = false;
    }

    togglePlayerPlay(detail: any): void {
        if (!detail.playable) return;

        if (detail == this.selectedDetail) {
            // toggle current media stream playing
            if (detail.playing) {
                this.stopMediaPlaying(detail);
            }
            else {
                this.startMediaPlaying(detail);
            }
        }
        else {
            if (this.selectedDetail && this.selectedDetail.playing) {
                // save current media playtime
                this.stopMediaPlaying(this.selectedDetail);
            }

            this.selectedDetail = detail;
            if (!detail.mediaStream) {
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
        let timer: Subscription = TimerObservable.create(0, 10).subscribe(
            () => {
                this.currentMediaStream = this.selectedDetail.mediaStream;
                timer.unsubscribe();

                let onCanPlay = this.api.getDefaultMedia().subscriptions.canPlay.subscribe(
                    () => {
                        onCanPlay.unsubscribe();

                        this.startMediaPlaying(this.selectedDetail, true);
                        this.selectedDetail.mediaLoading = false;
                    });
            });
    }

    loadRecordMedia(): void {
        this.selectedDetail.mediaLoading = true;
        this.services.getRecordMedia(this.selectedDetail.accountFile.id)
            .then(result => {
                console.log(result);
                this.selectedDetail.mediaStream = result.fileLink;
                this.startPlayRecord();
            })
            .catch(error => {
                console.log(error);
            });
    }

    // method is deprecated, but kept for knowledge base
    convertMediaDataToBlob(base64data: string): string {
        // const dataURI = 'data:audio/x-mp3;base64,' + base64data;
        const mimeType = 'audio/x-mp3';

        const byteString = atob(base64data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: mimeType});
        const blobUrl = window.URL.createObjectURL(blob);

        return blobUrl;
    }

    playerOpenClose(index) {
        this.selectedDetailIndex = index;
        this.details[this.selectedDetailIndex].playerAnimationState = this.details[this.selectedDetailIndex].playerAnimationState === 'min'
            ? 'max'
            : 'min';
    }

    playerAnimationStart() {
        if (this.details[this.selectedDetailIndex]) {
            console.log('PLAYER_ANIMATION1', this.details[this.selectedDetailIndex].playerAnimationState);
            console.log('PLAYER_ANIMATION2', this.details[this.selectedDetailIndex].playerContentShow);
            if (this.details[this.selectedDetailIndex].playerAnimationState === 'min') {
                this.details[this.selectedDetailIndex].playerContentShow = false;
            }
        }
    }

    playerAnimationEnd() {
        if (this.details[this.selectedDetailIndex]) {
            this.details[this.selectedDetailIndex].playerContentShow = this.details[this.selectedDetailIndex].playerContentShow === false;
            if (this.details[this.selectedDetailIndex].playerAnimationState === 'min') {
                this.details[this.selectedDetailIndex].playerContentShow = false;
            }
        }
    }

    /* ------------------------------------------------------
     * Records sorting and filtering
     * ------------------------------------------------------
     */

    checkTagUnselected(tag: string): boolean {
        return !this.grid.filter.checkTagSelected(tag);
    }

    sort(column: MediaGridColumn): void {
        this.grid.sort(column);
    }

    /* ------------------------------------------------------
     * Record row dropdown
     * ------------------------------------------------------
     */

    rowHoverStart(index) {
        this.rowHowerIndex = index;
        this.details[index].hover = true;
    }

    rowHoverEnd() {
        this.details.forEach((item, i) => {
            this.details[i].hover = false;
            this.details[i].ddShow = false;
        });
    }

    dropOpen(event, idx) {
        this.details[this.rowHowerIndex].ddShow = this.details[this.rowHowerIndex].ddShow === false;

        if ((this.details.length - 4) < idx) {
            this.dropDirection = 'top';
        } else {
            this.dropDirection = 'bottom';
        }
    }

    /* ------------------------------------------------------
     * Details & Records data retirieval
     * ------------------------------------------------------
     */

    private getDetailsAndRecords(): void {
        this.detailsDataLoading = true;
        let tags = this.grid.filter.selectedTags.map(t => {
            return t.key;
        });
        this.services.getDetailsAndRecords(
            this.grid.page,
            this.grid.limit,
            this.grid.sortedColumn.field,
            this.grid.sortedColumn.direction,
            tags)
            .then(result => {
                this.detailsDataLoading = false;
                // console.log(result);

                this.grid.items = result.items;
                this.grid.pageCount = result.pageCount;
                this.grid.page = result.page;

                this.details = result.items;
                this.details.forEach((item, i) => {
                    this.details[i].ddShow = false;

                    this.details[i].play = false;
                    this.details[i].playerAnimationState = 'min';
                    this.details[i].playerContentShow = false;
                    this.details[i].player = {};
                    this.details[i].playerLoading = false;
                    // this.details[i].payerState = 'stop';
                    this.details[i].playerSeek = '';

                    this.details[i].playable = this.details[i].accountFile && this.details[i].duration > 0;
                    this.details[i].playing = false;
                    this.details[i].mediaStream = null;
                    this.details[i].mediaLoading = false;
                    this.details[i].mediaPlayTime = 0;
                });

                this.selectedDetailIndex = -1;
            })
            .catch(error => {
                this.detailsDataLoading = false;
                console.error(error);
            });
    }
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
