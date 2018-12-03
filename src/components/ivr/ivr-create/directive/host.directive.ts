import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[hostIvr]',
})
export class HostIvrFormDirective {
    constructor(public viewContainerRef: ViewContainerRef) 
    {}
}
