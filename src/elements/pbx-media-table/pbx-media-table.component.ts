import {Component, PipeTransform, Pipe, ViewChild, ViewChildren, QueryList, Output, EventEmitter, OnChanges, SimpleChanges} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {TimerObservable} from "rxjs/observable/TimerObservable";
import {VgAPI} from "videogular2/core";
import {VgHLS} from "videogular2/src/streaming/vg-hls/vg-hls";
import {TableComponent} from "../pbx-table/pbx-table.component";
import {FadeAnimation} from "../../shared/fade-animation";
import {PlayerAnimation} from "../../shared/player-animation";
import {MediaPlayerComponent} from "../pbx-media-player/pbx-media-player.component";
import {CdrItem} from "../../models/cdr.model";

@Component({
    selector: 'pbx-media-table',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        FadeAnimation('200ms'),
        PlayerAnimation
    ]
})
export class MediaTableComponent extends TableComponent implements OnChanges {

    public currentMediaStream: string;

    private _selectedItem: any;
    private _itemsSubscribed = false;

    @ViewChildren('mediaPlayer') players: QueryList<MediaPlayerComponent>;
    @ViewChild(VgHLS) vgHls: VgHLS;
    api: VgAPI;

    @Output() onGetMediaData: EventEmitter<CdrItem> = new EventEmitter<CdrItem>();

    // - component level methdos --------------------------

    ngOnInit(): void {}
    
    ngOnChanges(changes: SimpleChanges) {
        if (changes.tableItems) {
            this.subscribePlayerEvents();
        }
    }

    // - media player properties --------------------------

    onPlayerReady(api: VgAPI): void {
        this.api = api;
        if (!this._itemsSubscribed) {
            this.subscribePlayerEvents();
        }
    }

    subscribePlayerEvents(): void {
        this._itemsSubscribed = false;
        if (this.api) {
            this.tableItems.forEach((item: CdrItem) => {
                item.record.onTimeChange = this.api.subscriptions.timeUpdate.subscribe((e) => {
                    if (item.record.playing) {
                        item.record.mediaPlayTime = this.api.currentTime;
                        let player = this.players.find(pl => pl.item == item);
                        if (player) {
                            player.updateWaveRange();
                        }
                    }
                });
                item.record.onPlayEnd = this.api.subscriptions.ended.subscribe((e) => {
                    if (item.record.playing) {
                        item.record.playing = false;
                    }
                });
            });
            this._itemsSubscribed = true;
        }
    }

    startMediaPlaying(item: CdrItem, forceTimeSeek?: boolean): void {
        if (!item.record.playable) return;

        if (item.record.mediaPlayTime >= item.record.duration) {
            item.record.mediaPlayTime = 0;
            forceTimeSeek = true;
        }

        if (forceTimeSeek) {
            this.api.seekTime(item.record.mediaPlayTime, false);
        }

        this.api.play();
        item.record.playing = true;
    }

    stopMediaPlaying(item: CdrItem): void {
        if (!item || !item.record.playable) return;

        this.api.pause();
        item.record.mediaPlayTime = this.api.currentTime;
        item.record.playing = false;
    }

    togglePlay(item: CdrItem): void {
        if (!item.record.playable) return;

        if (item == this._selectedItem) {
            // toggle current media stream playing
            if (item.record.playing) {
                this.stopMediaPlaying(item);
            }
            else {
                this.startMediaPlaying(item);
            }
        }
        else {
            if (this._selectedItem && this._selectedItem.record.playing) {
                // save current media playtime
                this.stopMediaPlaying(this._selectedItem);
            }

            this._selectedItem = item;
            this.tableItems.forEach(i => {
                if (i != item && i.record.mediaLoading) i.record.mediaLoading = false;
            });
            if (!item.record.mediaStream) {
                // load selected detail media data
                this.loadMediaData(item);
            }
            else {
                // switch to selected detail media stream
                this.startPlayRecord();
            }
        }
    }
    
    loadMediaData(item: CdrItem): void {
        this.onGetMediaData.emit(item);
    }

    setMediaData(item: CdrItem): void {
        if (item == this._selectedItem) {
            this.startPlayRecord();
        }
    }

    startPlayRecord(): void {
        this._selectedItem.record.mediaLoading = true;
        let timer: Subscription = TimerObservable.create(0, 100).subscribe(
            () => {
                timer.unsubscribe();
                this.currentMediaStream = this._selectedItem.record.mediaStream;

                let onCanPlay = this.api.getDefaultMedia().subscriptions.canPlay.subscribe(
                    () => {
                        onCanPlay.unsubscribe();

                        this.startMediaPlaying(this._selectedItem, true);
                        this._selectedItem.record.mediaLoading = false;
                    });
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
