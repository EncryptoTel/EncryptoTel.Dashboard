import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ModalComponent, ModalEx } from '@elements/pbx-modal/pbx-modal.component';

@Injectable()
export class ModalServices {
    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector) {
    }
    componentRef: any;
    createModal(modal) {
        this.componentRef = this.componentFactoryResolver
            .resolveComponentFactory(ModalComponent)
            .create(this.injector);
        this.componentRef.instance.modalEx = modal;
        this.componentRef.changeDetectorRef.detectChanges();
        this.appRef.attachView(this.componentRef.hostView);
        const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);
        return this.componentRef.instance;
    }

    deleteModal() {
        if (this.componentRef) {
            this.appRef.detachView(this.componentRef.hostView);
            this.componentRef.destroy();
        }
    }
}