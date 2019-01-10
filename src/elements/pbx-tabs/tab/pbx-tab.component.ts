import { Component, Input } from '@angular/core';

@Component({
    selector: 'pbx-tab',
    template: `
    <div class='tab-content' [hidden]="!active">
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
    id: number;
    @Input() title: string;
    @Input() active = false;
}
