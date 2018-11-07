import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
    selector: 'pbx-validation-tooltip',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})

export class ValidationTooltipComponent implements OnInit, AfterViewInit, OnDestroy {

    errorMessage: string = '';
    position = { left: 0, top: 0 };
    left: Number = 0;
    top: Number = 0;
    isLeft = true;
    widthObservable: any;
    parentElem: any;
    visible = 'none';
    @ViewChild('tooltipElement') tooltipe: ElementRef;

    constructor(private _changeDetectionRef: ChangeDetectorRef) {
        window.addEventListener('scroll', this.onWindowScroll, true);
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        const pos = this.parentElem.getBoundingClientRect();
        console.log(this.tooltipe.nativeElement.offsetWidth);
        this.left = pos.left - (this.isLeft ? this.tooltipe.nativeElement.offsetWidth - 6 : 0);
        this.top = pos.top + (this.isLeft ? 0 : 40);
        this.visible = 'block';
        this._changeDetectionRef.detectChanges();
    }

    onWindowScroll = (): void => {
        const pos = this.parentElem.getBoundingClientRect();
        this.left = pos.left - (this.isLeft ? this.tooltipe.nativeElement.offsetWidth - 6 : 0);
        this.top = pos.top + (this.isLeft ? 0 : 40);
    }

    ngOnDestroy(): void {
        window.removeEventListener('scroll', this.onWindowScroll, true);
    }
}
