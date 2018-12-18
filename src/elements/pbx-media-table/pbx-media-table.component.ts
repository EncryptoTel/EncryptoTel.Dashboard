import {Component, PipeTransform, Pipe, ViewChild, ViewChildren, QueryList, Output, EventEmitter, OnChanges, SimpleChanges, Input, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {VgAPI} from 'videogular2/core';
import {VgHLS} from 'videogular2/src/streaming/vg-hls/vg-hls';

import {FadeAnimation} from '@shared/fade-animation';
import {PlayerAnimation} from '@shared/player-animation';
import {TableComponent} from '../pbx-table/pbx-table.component';
import {MediaTablePlayerComponent} from '../pbx-media-table-player/pbx-media-table-player.component';


@Component({
    selector: 'pbx-media-table',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        FadeAnimation('200ms'),
        PlayerAnimation
    ]
})
export class MediaTableComponent extends TableComponent implements OnInit, OnChanges {

    public currentMediaStream: string = '/assets/mp3/silence.mp3';

    private _selectedItem: any;
    private _itemsSubscribed = false;

    noDataToDisplayText: string;

    @ViewChildren('mediaPlayer') players: QueryList<MediaTablePlayerComponent>;
    // @ViewChild(VgHLS) vgHls: VgHLS;
    api: VgAPI;

    @Input() selectedItems: any[];

    @Output() onGetMediaData: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

    // - component level methdos --------------------------

    ngOnInit(): void {
        this.noDataToDisplayText = this.translate.instant('No data to display');
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.tableItems) {
            this.subscribePlayerEvents();
        }
    }

    selectItem(item: any): void {
        this.onSelect.emit(item);
    }

    isItemSelected(item: any): boolean {
        return (this.selectedItems)
            ? this.selectedItems.some(i => i == item.id)
            : false;
    }

    // - media player methods -----------------------------

    onPlayerReady(api: VgAPI): void {
        this.api = api;
        if (!this._itemsSubscribed) {
            this.subscribePlayerEvents();
        }
    }

    subscribePlayerEvents(): void {
        this._itemsSubscribed = false;
        if (this.api) {
            this.tableItems.forEach((item: any) => {
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

    startMediaPlaying(item: any, forceTimeSeek?: boolean): void {
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

    stopMediaPlaying(item: any): void {
        if (!item || !item.record.playable) return;

        this.api.pause();
        item.record.mediaPlayTime = this.api.currentTime;
        item.record.playing = false;
    }

    togglePlay(item: any): void {
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

    loadMediaData(item: any): void {
        this.onGetMediaData.emit(item);
    }

    setMediaData(item: any): void {
        if (item === this._selectedItem) {
            this.startPlayRecord();
        }
    }

    startPlayRecord(): void {
        if (this.currentMediaStream == this._selectedItem.record.mediaStream) {
            this.startMediaPlaying(this._selectedItem, true);
        }

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
