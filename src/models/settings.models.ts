import { Type } from 'class-transformer';
import { BaseItemModel, PageInfoModel } from './base.model';
import { formatDateTime } from '../shared/shared.functions';

export class SessionsModel extends PageInfoModel {
    items: SessionItem[] = [];
}

export class SessionItem extends BaseItemModel {
    country: string;
    ip: string;
    userAgent: string;
    userToken: string;
    session: string;
    expires: string;
    active: boolean;

    get displayExpires() {
        return formatDateTime(this.expires);
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
}

export class SettingsItem extends SettingsBaseItem {
    type: 'bool' | 'int' | 'string' | 'list' = 'string';
    id: number;
    value: any;
    options: SettingsOptionItem[] = null;
}

export class SettingsOptionItem {
    constructor(public id: number, public value: string) {}
}

export class SettingsModel {
    items: SettingsBaseItem[] = [];

    static create(plainObj: any): SettingsModel {
        const model = new SettingsModel();

        Object.keys(plainObj).forEach(key => {
            const item = this.createItem(key, plainObj[key]);
            model.items.push(item);
        });

        return model;
    }

    static createItem(key: string, plainObj: any): SettingsBaseItem {
        const item = SettingsItemFactory.createItem(key, plainObj.type);

        Object.keys(plainObj).forEach(key => {
            if (key !== 'children' && key !== 'list_value') {
                item[key] = plainObj[key];
            } else if (key === 'list_value') {
                (<SettingsItem>item).options = Object.keys(
                    plainObj.list_value
                ).map(lkey => {
                    return new SettingsOptionItem(
                        +lkey,
                        plainObj.list_value[lkey]
                    );
                });
            } else if (key === 'children') {
                Object.keys(plainObj.children).forEach(childKey => {
                    (<SettingsGroupItem>item).children.push(
                        this.createItem(childKey, plainObj.children[childKey])
                    );
                });
            }
        });

        return item;
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
