import {Component, Input, EventEmitter, Output} from '@angular/core';

import {PlayerAnimation} from '@shared/player-animation';
import {FadeAnimation} from '@shared/fade-animation';


@Component({
  selector: 'pbx-media-table-player',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [
    FadeAnimation('200ms'),
    PlayerAnimation
  ]
})
export class MediaTablePlayerComponent {
    waveRange: Array<string>;

    @Input() item: any;

    @Output() onTogglePlay: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
        this.updateWaveRange();
    }

    updateWaveRange(): void {
        this.waveRange = [];
        for (let i = 0; i < 24; ++ i) {
            let className = (i + 2) % 3 === 0 ? 'tall' : 'small';
            if (this.item) {
                className += ((this.item.record.mediaPlayTime / this.item.record.duration) * 24 > i)
                    ? ' active'
                    : '';
            }
            this.waveRange.push(className);
        }
    }

    animationStart(): void {
        if (this.item.player.animationState === 'min') {
            this.item.player.expanded = false;
        }
    }

    animationEnd(): void {
        this.item.player.expanded = !this.item.player.expanded;
        if (this.item.player.animationState === 'min') {
            this.item.player.expanded = false;
        }
    }

    toggleView(): void {
        this.item.player.animationState = this.item.player.animationState === 'min' ? 'max' : 'min';
    }

    togglePlay(e): void {
        e.stopPropagation();
        this.onTogglePlay.emit(this.item);
    }
}
