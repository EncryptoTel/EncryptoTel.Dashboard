import {Component, Input} from '@angular/core';

import {SidebarInfo} from '../../models/sidebar-info.model';

@Component({
  selector: 'pbx-sidebar',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class SidebarComponent {
  @Input() sidebarInfo: SidebarInfo;
  isSingleLine = (description): boolean => {
    return typeof description === 'string';
  }
}
