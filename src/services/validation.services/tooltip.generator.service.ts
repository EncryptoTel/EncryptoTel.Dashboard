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

  componentRef
  showTooltip(message: string, position: any, element:any ) {
    console.log(arguments);
    this.hideTooltip();
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ValidationTooltipComponent)
      .create(this.injector);
    this.componentRef.instance.errorMessage = message;
    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);
  }

  hideTooltip() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
    }
  }
}