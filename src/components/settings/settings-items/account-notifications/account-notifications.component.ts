import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SettingsServices} from '../../../../services/settings.services';

@Component({
  selector: 'account-notifications-component',
  templateUrl: './template.html',
  providers: [SettingsServices]
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
      return ev === true ? '1' : '0';
    } else if (typeof ev === 'string') {
      return ev;
    } else {
      return ev.title;
    }
  }

  saveOption(ev: any, key: string, inputKey: string, childrenKey?: string): void {
    if (this.settings[key].children[inputKey].type === 'list') {
      this.selectedItems[key] = ev;
    }
    this._services.saveSetting(!childrenKey ?
      this.settings[key].children[inputKey].id : this.settings[key].children[inputKey].children[childrenKey].id, this.getEventValue(ev), 'account/notifications')
      .then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      });
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
