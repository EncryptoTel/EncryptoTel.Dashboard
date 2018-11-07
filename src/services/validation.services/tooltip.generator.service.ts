import {
  Injectable,
  Injector,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  ApplicationRef
} from '@angular/core';
import { ValidationTooltipComponent } from '@elements/pbx-validation-tooltip/pbx-validation.tooltip.component';

@Injectable()
export class TooltipGeneratorService {

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  componentRef: any;

  showTooltip(message: string, isLeft: boolean, element: any) {
    this.hideTooltip();
    if (message && true) {

      this.componentRef = this.componentFactoryResolver
        .resolveComponentFactory(ValidationTooltipComponent)
        .create(this.injector);
      this.componentRef.instance.errorMessage = message;
      this.componentRef.instance.parentElem = element.target;
      this.appRef.attachView(this.componentRef.hostView);
      const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
      this.componentRef.instance.isLeft = isLeft;
    }
  }

  hideTooltip() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
    }
  }
}
