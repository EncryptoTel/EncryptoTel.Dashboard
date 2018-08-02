import {Component, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {VgAPI} from 'videogular2/core';
import {VgHLS} from 'videogular2/src/streaming/vg-hls/vg-hls';
import {Subscription} from '../../../node_modules/rxjs/Subscription';
import {TimerObservable} from '../../../node_modules/rxjs/observable/TimerObservable';
import { MediaState } from '../../models/cdr.model';

@Component({
    selector: 'pbx-media-player',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class MediaPlayerComponent implements OnChanges {
    api: VgAPI;

    mediaStreams: {};
    selectedMediaId: number;
    loading: number;
    
    @Input() mediaStream: string;

    @Output() onPlayerReady: EventEmitter<VgAPI>;
    @Output() onTimeUpdate: EventEmitter<object>;
    @Output() onPlayEnd: EventEmitter<number>;
    @Output() onGetMediaData: EventEmitter<number>;
    @Output() onMediaStateChanged: EventEmitter<MediaState>;

    @ViewChild(VgHLS) vgHls: VgHLS;

    get state(): MediaState {
        if (this.loading) return MediaState.Loading;
        return (this.api && this.api.state == 'playing') 
            ? MediaState.Playing 
            : MediaState.Paused;
    }

    constructor() {
        this.selectedMediaId = 0;
        this.onPlayerReady = new EventEmitter();
        this.onTimeUpdate = new EventEmitter();
        this.onPlayEnd = new EventEmitter();
        this.onGetMediaData = new EventEmitter();
        this.onMediaStateChanged = new EventEmitter();
        this.mediaStreams = {};
        this.loading = 0;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.mediaStream && changes.mediaStream.currentValue) {
            this.loading --;
            this.mediaStreams[this.selectedMediaId] = changes.mediaStream.currentValue;
            this.startPlayRecord();
        }
    }

    playerReady(api: VgAPI): void {
        this.api = api;
        this.api.subscriptions.timeUpdate.subscribe(e => {
            this.onTimeUpdate.emit(this.api.currentTime);
        });
        this.api.subscriptions.ended.subscribe((e) => {
            this.onPlayEnd.emit(this.selectedMediaId);
            this.fireOnMediaStateChanged();
        });
        this.onPlayerReady.emit(api);
    }

    fireOnMediaStateChanged(): void {
        let timer: Subscription = TimerObservable.create(100, 0).subscribe(
            () => {
                timer.unsubscribe();
                this.onMediaStateChanged.emit(this.state);
            }
        );
    }

    stopPlay(): void {
        if (this.api && this.api.state == <string>MediaState.Playing) {
            this.api.pause();
            this.fireOnMediaStateChanged();
        }
    }

    togglePlay(mediaId: number) {
        if (this.mediaStreams[mediaId]) {
            if (mediaId != this.selectedMediaId) {
                this.selectedMediaId = mediaId;
                this.startPlayRecord();
            }
            else {
                // states are: playing, pause, ended
                if (this.api.state == <string>MediaState.Playing) {
                    this.api.pause();
                }
                else {
                    this.api.play();
                }
                this.fireOnMediaStateChanged();
            }
        }
        else {
            if (mediaId != this.selectedMediaId) {
                this.selectedMediaId = mediaId;
                this.onGetMediaData.emit(mediaId);
                this.loading ++;
                this.fireOnMediaStateChanged();
            }
        }
    }

    startPlayRecord(): void {
        let timer: Subscription = TimerObservable.create(0, 100).subscribe(
            () => {
                timer.unsubscribe();
                this.mediaStream = this.mediaStreams[this.selectedMediaId];

                let onCanPlay = this.api.getDefaultMedia().subscriptions.canPlay.subscribe(
                    () => {
                        onCanPlay.unsubscribe();
                        this.fireOnMediaStateChanged();
                    });
            });
    }
}
