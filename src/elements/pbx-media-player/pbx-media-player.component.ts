import {Component, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {VgAPI} from 'videogular2/core';
import {VgHLS} from 'videogular2/src/streaming/vg-hls/vg-hls';
import {Subscription} from 'rxjs/Subscription';
import {TimerObservable} from 'rxjs/observable/TimerObservable';

import { MediaState } from '../../models/cdr.model';
import {Locker} from '../../models/locker.model';


@Component({
    selector: 'pbx-media-player',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class MediaPlayerComponent implements OnChanges {

    api: VgAPI;

    mediaStreams: {} = {};
    selectedMediaId: number = 0;
    locker: Locker = new Locker();

    @Input() mediaStream: string;

    @Output() onPlayerReady: EventEmitter<VgAPI> = new EventEmitter<VgAPI>();
    @Output() onTimeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onPlayEnd: EventEmitter<number> = new EventEmitter<number>();
    @Output() onGetMediaData: EventEmitter<number> = new EventEmitter<number>();
    @Output() onMediaStateChanged: EventEmitter<MediaState> = new EventEmitter<MediaState>();

    @ViewChild(VgHLS) vgHls: VgHLS;


    get state(): MediaState {
        if (!this.locker.free) return MediaState.LOADING;

        return (this.api && this.api.state === 'playing')
            ? MediaState.PLAYING
            : MediaState.PAUSED;
    }

    constructor()
    {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.mediaStream && changes.mediaStream.currentValue) {
            this.locker.unlock();
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
        const timer: Subscription = TimerObservable.create(100, 0).subscribe(
            () => {
                timer.unsubscribe();
                this.onMediaStateChanged.emit(this.state);
            }
        );
    }

    stopPlay(): void {
        if (this.api && this.api.state === <string>MediaState.PLAYING) {
            this.api.pause();
            this.fireOnMediaStateChanged();
        }
    }

    togglePlay(mediaId: number) {
        if (this.mediaStreams[mediaId]) {
            if (mediaId !== this.selectedMediaId) {
                this.selectedMediaId = mediaId;
                this.startPlayRecord();
            }
            else {
                // states are: playing, pause, ended
                if (this.api.state === <string>MediaState.PLAYING) {
                    this.api.pause();
                }
                else {
                    this.api.play();
                }
                this.fireOnMediaStateChanged();
            }
        }
        else {
            if (mediaId !== this.selectedMediaId) {
                this.selectedMediaId = mediaId;
                this.onGetMediaData.emit(mediaId);
                this.locker.lock();
                this.fireOnMediaStateChanged();
            }
        }
    }

    delay(ms: number) {
        return new Promise<void>(function(resolve) {
            setTimeout(resolve, ms);
        });
    }

    startPlayRecord() {
        setTimeout(async () => {
            this.mediaStream = this.mediaStreams[this.selectedMediaId];
            console.log('media-stream-selected', this.mediaStream);

            let attempt = 0;
            while (!this.api.getDefaultMedia().canPlay && attempt < 10) {
                await this.delay(100);
                ++ attempt;
            }

            if (attempt < 10) {
                this.togglePlay(this.selectedMediaId);
                this.fireOnMediaStateChanged();
            }
            else {
                console.log('Media stream loading error');
            }
        }, 100);
    }
}
