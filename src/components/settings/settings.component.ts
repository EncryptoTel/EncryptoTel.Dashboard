import {Component} from '@angular/core';
import {MainViewComponent} from '../main-view.component';


@Component({
  selector: 'pbx-settings',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class SettingsComponent {
  currentTheme: string;
  constructor(private _main: MainViewComponent) {
    this.currentTheme = this._main.userTheme;
  }

  changeTheme(theme: string): void {
    if (this.currentTheme !== theme) {
      this._main.setUserTheme(theme);
      this.currentTheme = this._main.userTheme;
    }
  }
}
