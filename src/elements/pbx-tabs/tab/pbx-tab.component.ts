import { Component, Input } from "@angular/core";

@Component({
    selector: 'pbx-tab',
    template: `
    <div [hidden]="!active">
        <ng-content></ng-content>
    </div>
    `,
    // styleUrls: ['./local.sass'],
    styles: [`
    [hidden] {
        display: none !important;
      }
    `]
})
export class TabComponent {
    @Input('tabTitle') title: string;
    @Input() active = false;
}