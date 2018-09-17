import { Directive, AfterViewInit, ElementRef } from '@angular/core';

@Directive({
    selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

    constructor(private el: ElementRef) {
    }

    ngAfterViewInit() {
        let focus: string;
        focus = this.el.nativeElement.getAttribute('data-focus');
        if (focus === 'true') {
            this.el.nativeElement.focus();
        }
    }

}
