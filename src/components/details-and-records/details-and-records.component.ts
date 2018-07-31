import {Component, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {VgAPI} from 'videogular2/core';
import {VgHLS} from 'videogular2/src/streaming/vg-hls/vg-hls';
import {FadeAnimation} from '../../shared/fade-animation';
import {PlayerAnimation} from '../../shared/player-animation';
import {CdrService} from '../../services/cdr.service';
import {MediaGridColumn, MediaGrid} from '../../models/media-grid.model';
import {WsServices} from "../../services/ws.services";
import {CdrItem, CdrModel} from "../../models/cdr.model";

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

    /* ------------------------------------------------------
     * Component initialization
     * ------------------------------------------------------
     */

    constructor(private service: CdrService,
                private ws: WsServices) {
        this.cdrSubscription = this.ws.subCdr().subscribe(() => {
            let item = new CdrItem();
            this.pageInfo.items.unshift(item);
            this.getItems(item);
        });
        this.grid = new MediaGrid([
            new MediaGridColumn('source', 'From', true),
            new MediaGridColumn('destination', 'To', true),
            new MediaGridColumn('callDate', 'Date', true),
            new MediaGridColumn('duration', 'Duration'),
            new MediaGridColumn('status', 'Tag', true),
            new MediaGridColumn('price', 'Price', false),
            new MediaGridColumn('record', 'Record', false),
        ]);

        this.grid.dataUpdateRequired.subscribe(event => {
            // console.log('dataUpdateRequired');
            this.getItems();
        });

        this.grid.setFilterTags([
            {key: 'noAnswer', title: 'no-answer'},
            {key: 'incoming', title: 'incoming'},
            {key: 'outgoing', title: 'outgoing'},
            {key: 'missed', title: 'missed'},
            {key: 'record', title: 'record'},
        ]);
    }

    /* ------------------------------------------------------
     * Details & Records data retirieval
     * ------------------------------------------------------
     */

    private getItems(item = null): void {
        // console.log('getItems');
        (item ? item : this).loading++;
        let tags = this.grid.filter.selectedTags.map(t => {
            return t.key;
        });
        this.service.getItems(this.pageInfo, {status: tags.length > 0 ? tags : null},
            {
                column: this.grid.sortedColumn.field,
                isDown: this.grid.sortedColumn.direction === 'desc'
            }).then(result => {
            this.pageInfo = result;
            this.grid.items = result.items;
            this.selectedDetailIndex = -1;
            (item ? item : this).loading--;
        }).catch(() => {
            (item ? item : this).loading--;
        });
    }

    ngOnInit() {
        // sort 1st column by default
        this.grid.sortByIndex(2);
    }


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
        this.service.getRecordMedia(this.selectedDetail.accountFile.id)
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
        this.pageInfo.items[this.selectedDetailIndex].playerAnimationState = this.pageInfo.items[this.selectedDetailIndex].playerAnimationState === 'min'
            ? 'max'
            : 'min';
    }

    playerAnimationStart() {
        if (this.pageInfo.items[this.selectedDetailIndex]) {
            console.log('PLAYER_ANIMATION1', this.pageInfo.items[this.selectedDetailIndex].playerAnimationState);
            console.log('PLAYER_ANIMATION2', this.pageInfo.items[this.selectedDetailIndex].playerContentShow);
            if (this.pageInfo.items[this.selectedDetailIndex].playerAnimationState === 'min') {
                this.pageInfo.items[this.selectedDetailIndex].playerContentShow = false;
            }
        }
    }

    playerAnimationEnd() {
        if (this.pageInfo.items[this.selectedDetailIndex]) {
            this.pageInfo.items[this.selectedDetailIndex].playerContentShow = this.pageInfo.items[this.selectedDetailIndex].playerContentShow === false;
            if (this.pageInfo.items[this.selectedDetailIndex].playerAnimationState === 'min') {
                this.pageInfo.items[this.selectedDetailIndex].playerContentShow = false;
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
        this.pageInfo.items[index].hover = true;
    }

    rowHoverEnd() {
        this.pageInfo.items.forEach((item, i) => {
            this.pageInfo.items[i].hover = false;
            this.pageInfo.items[i].ddShow = false;
        });
    }

    dropOpen(event, idx) {
        this.pageInfo.items[this.rowHowerIndex].ddShow = this.pageInfo.items[this.rowHowerIndex].ddShow === false;

        if ((this.pageInfo.items.length - 4) < idx) {
            this.dropDirection = 'top';
        } else {
            this.dropDirection = 'bottom';
        }
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
