import { BaseItemModel, PageInfoModel } from '@models/base.model';
import { formatDateTime } from '@shared/shared.functions';


export class SessionsModel extends PageInfoModel {
  items: SessionItem[] = [];

  private _locale: string = 'en';
  get locale(): string {
    return this._locale;
  }
  set locale(locale: string) {
    this._locale = locale;
    if (this.items && this.items.length) {
      this.items.forEach(i => i.locale = locale);
    }
  }
}

export class SessionItem extends BaseItemModel {
    country: string;
    ip: string;
    userAgent: string;
    userToken: string;
    session: string;
    expires: string;
    active: boolean;
    
    locale: string = 'en';

    get displayExpires(): string {
        return formatDateTime(this.expires, null, this.locale);
    }

    get status(): string {
        return this.active ? 'online' : '';
    }
}

export class SettingsBaseItem {
    key: string = '';
    name: string = '';
    title: string = '';
    type: 'group' | 'group_field' | 'bool' | 'int' | 'string' | 'list' =
        'group';

    constructor(
        key: string,
        type: 'group' | 'group_field' | 'bool' | 'int' | 'string' | 'list'
    ) {
        this.key = key;
        this.type = type;
    }

    get isGroup(): boolean {
        return this.type === 'group' || this.type === 'group_field';
    }

    get itemTitle(): string {
        let text = this.title;

        text = text
            .replace(/\r?\n/g, '')
            .replace(/_/g, ' ')
            .replace(
                /\w\S*/g,
                txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase()
            );

        return text.trim();
    }

    set itemTitle(value) {
        this.title = value;
    }

    get itemLabel(): string {
        let text = this.title;

        text = text
            .replace(/\r?\n/g, '')
            .replace(/_/g, ' ')
            .replace(
                /^\w/,
                txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase()
            );

        return text.trim();
    }
}

export class SettingsGroupItem extends SettingsBaseItem {
    type: 'group' | 'group_field' = 'group';
    children: SettingsBaseItem[] = [];
    comment: string;
}

export class SettingsItem extends SettingsBaseItem {
    type: 'bool' | 'int' | 'string' | 'list' = 'string';
    id: number;
    value: any;
    options: SettingsOptionItem[] = null;
}

export class SettingsOptionItem {
    constructor(
        public id: number, 
        public value: string
    ) {}
}

export class SettingsModel {
    items: SettingsBaseItem[] = [];

    static create(plainObj: any, exDataMap: any = null): SettingsModel {
        const model = new SettingsModel();

        Object.keys(plainObj).forEach(key => {
            const item = this.createItem(key, plainObj[key], exDataMap);
            model.items.push(item);
        });

        return model;
    }

    static createItem(key: string, plainObj: any, exDataMap: any = null): SettingsBaseItem {
        const item = SettingsItemFactory.createItem(key, plainObj.type);

        Object.keys(plainObj).forEach(okey => {
            if (okey !== 'children' && okey !== 'list_value') {
                item[okey] = plainObj[okey];
            }
            else if (okey === 'list_value') {
                (<SettingsItem>item).options = Object.keys(
                    plainObj.list_value
                ).map(lkey => {
                    return new SettingsOptionItem(
                        +lkey,
                        plainObj.list_value[lkey]
                    );
                });
            }
            else if (okey === 'children') {
                Object.keys(plainObj.children).forEach(childKey => {
                    (<SettingsGroupItem>item).children.push(
                        this.createItem(childKey, plainObj.children[childKey], exDataMap)
                    );
                });
            }
        });
        this.mapExData(item, exDataMap);

        return item;
    }

    static mapExData(item: SettingsBaseItem, exDataMap: any): void {
        if (!exDataMap) return;

        Object.keys(exDataMap).forEach(mapKey => {
            if (item.key === mapKey) {
                Object.keys(exDataMap[mapKey]).forEach(exKey => {
                    const mapData: any = exDataMap[mapKey][exKey];
                    if (exKey === 'list_value') {
                        Object.keys(mapData).forEach(id => {
                            const option = (<SettingsItem>item).options.find(o => o.id === +id);
                            if (option) option.value = mapData[id];
                        });
                    }
                    else {
                        item[exKey] = mapData;
                    }
                });
            }
        });
    }
}

export class SettingsItemFactory {
    static createItem(key: string, type: string): SettingsBaseItem {
        switch (type) {
            case 'group':
            case 'group_field':
                return new SettingsGroupItem(key, type);
            case 'bool':
            case 'int':
            case 'string':
            case 'list':
                return new SettingsItem(key, type);
            default:
                throw new Error(`Type '${type}' is not supported`);
        }
    }
}
