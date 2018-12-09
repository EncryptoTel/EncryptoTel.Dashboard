import {Directive, EventEmitter, Output, Input, HostListener} from "@angular/core";

export type ScrollEvent = {
    isReachingBottom: boolean,
    isReachingTop: boolean,
    originalEvent: Event,
    isWindowEvent: boolean,
    top: number,
    left: number,
};
  
declare const window: Window;
  
@Directive({
    selector: '[detect-scroll]'
})
export class ScrollDirective {
    @Input() bottomOffset: number = 100;
    @Input() topOffset: number = 100;

    @Output() onScroll = new EventEmitter<ScrollEvent>();

    constructor() {}

    @HostListener('scroll', ['$event']) scrolled($event: Event) {
        this.elementScrollEvent($event);
    }

    protected elementScrollEvent($event: Event) {
        const target = <HTMLElement>$event.target;
        const scrollPosition = target.scrollHeight - target.scrollTop;
        const offsetHeight = target.offsetHeight;
        const isReachingTop = target.scrollTop < this.topOffset;
        const isReachingBottom = (scrollPosition - offsetHeight) < this.bottomOffset;
        const emitValue: ScrollEvent = { isReachingBottom, isReachingTop, originalEvent: $event, isWindowEvent: false, top: target.scrollTop, left: target.scrollLeft };
        this.onScroll.emit(emitValue);
    }
}