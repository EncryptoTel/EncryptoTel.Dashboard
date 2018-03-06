import {Component} from '@angular/core';


@Component({
  selector: 'pbx-settings',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class SettingsComponent {
  currentTheme = 'black';

  changeTheme(theme: string): void {
    this.currentTheme = theme;
  }
}
