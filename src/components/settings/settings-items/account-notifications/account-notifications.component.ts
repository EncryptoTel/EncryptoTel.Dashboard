import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SettingsServices} from '../../../../services/settings.services';
import {FadeAnimation} from '../../../../shared/fade-animation';

@Component({
  selector: 'account-notifications-component',
  templateUrl: './template.html',
  providers: [SettingsServices],
  styleUrls: ['../local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class AccountNotificationsComponent implements OnInit {

  loading = {
    body: false
  };

  settings: any;

  selectedItems: any = {};

  constructor(private _services: SettingsServices,
              private router: Router) {
  }

  NormalizeTitle(text: string) {
    text = text.replace(/\r?\n/g, '');
    text = text.replace(new RegExp('_', 'g'), ' ');
    text = text.charAt(0).toUpperCase() + text.substr(1);
    return text.trim();
  }

  goBack(): void {
    this.router.navigateByUrl('/cabinet/settings');
  }

  getKeys = (obj: any): string[] => {
    return Object.keys(obj);
  }
  generateOptions = (obj: any): any[] => {
    const tmp = [];
    Object.keys(obj).forEach(key => {
      tmp.push({id: key, title: obj[key]});
    });
    return tmp;
  }
  getEventValue = (ev: any): any => {
    if (typeof ev === 'boolean') {
      return ev;
    } else if (typeof ev === 'string') {
      return ev;
    } else {
      return ev.id;
    }
  }

  saveOption(ev: any, key: string, inputKey: string, childrenKey?: string): void {
    if (this.settings[key].children[inputKey].type === 'list') {
      this.selectedItems[key] = ev;
    }
    this._services.saveSetting(!childrenKey ?
      this.settings[key].children[inputKey].id : this.settings[key].children[inputKey].children[childrenKey].id, this.getEventValue(ev), 'account/notifications')
      .then().catch();
  }

  getInitialParams(): void {
    this.loading.body = true;
    this._services.getNotificationsParams()
      .then(res => {
        Object.keys(res.settings).forEach(key => {
          Object.keys(res.settings[key].children).map(inputKey => {
            if (res.settings[key].children[inputKey].type === 'list') {
              const selectedId = res.settings[key].children[inputKey].value;
              this.selectedItems[inputKey] = {
                id: selectedId,
                title: res.settings[key].children[inputKey].list_value[selectedId]
              };
            } else if (res.settings[key].children[inputKey].type === 'group_field') {
              Object.keys(res.settings[key].children[inputKey].children).forEach(childrenKey => {
                if (res.settings[key].children[inputKey].children[childrenKey].type === 'list') {
                  const selectedId = res.settings[key].children[inputKey].children[childrenKey].value;
                  this.selectedItems[childrenKey] = {
                    id: selectedId,
                    title: res.settings[key].children[inputKey].children[childrenKey].list_value[selectedId]
                  };
                }
              });
            }
          });
        });
        this.settings = res.settings;
        this.loading.body = false;
      }).catch(() => this.loading.body = false);
  }

  ngOnInit() {
    this.getInitialParams();
  }
}
