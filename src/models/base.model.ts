import {Subscription} from "rxjs/Subscription";
import {Lockable, Locker} from "./locker.model";

export class PageInfoModel {
    public itemsCount: number;
    public page: number;
    public pageCount: number;
    public limit: number;
    public visible: boolean;
    public items = [];

    constructor() {
        this.limit = 10;
        this.page = 1;
    }
}

export class SortModel {
    public column: string;
    public isDown: boolean;
}

export class BaseItemModel {
    id: number;
    loading: number;

    constructor() {
        this.loading = 0;
    }

}

export class BaseButton implements Lockable {
    value: string;
    action: string;     // used to fire button action
    buttonType: string; // 'success|cancel'
    inactive: boolean;

    locker: Locker;

    constructor(value: string, action: string, type: string = 'success', inactive: boolean = false) {
        this.value = value;
        this.action = action;
        this.buttonType = type;
        this.inactive = inactive;

        this.locker = new Locker();
    }
}

export class BaseParam {
    id: number;
    code: string;
}

export class TableInfoModel {
    titles: string[];
    keys: string[];
}

export class TableInfoExModel {
    items: TableInfoItem[] = [];
    actions: TableInfoAction[] = [];
    sort: {
        isDown: boolean;
        column: string;
    } = {isDown: false, column: null};
}

export class TableInfoItem {
    title: string;
    key: string;
    width: number;
    dataWidth: number;
    sort: string;
    // Var is used for special item markup based on value.
    // Format:  [ { pattern: string, cssClass: string }, { ... } ]
    // Example: [ { pattern: '/disable(d)?/i', cssClass: 'gray' }, { ... } ]
    specialFormatting?: any[];
    noDataColumn: boolean;

    constructor(title: string, key: string, sort?: string, width?: number, dataWidth?: number, noDataColumn?: boolean) {
        this.title = title;
        this.key = key;
        this.width = width;
        this.dataWidth = dataWidth;
        this.sort = sort;
        this.noDataColumn = noDataColumn || false;
    }
}

export class TableInfoAction {
    id: number;
    type: string; //drop-down, player
    options: TableInfoActionOption[] = [];
    width: number = 50;

    constructor(id: number, type: string, width?: number) {
        this.id = id;
        this.type = type;
        this.width = width;
    }
}

export class TableInfoActionOption {
    id: number;
    title: string;
    className: string;

    constructor(id: number, title: string, className?: string) {
        this.id = id;
        this.title = title;
        this.className = className;
    }
}

export class SidebarInfoModel {
    loading: number = 0;
    saving: number = 0;
    visible: boolean;
    title: string;
    mode: string;
    position: string = 'column';
    hideEmpty: boolean;
    items: SidebarInfoItem[] = [];
    buttons: SidebarButtonItem[] = [];

    constructor() {

    }
}

/**
 * class SidebarInfoItem
 * Represetns item to display inside SidebarComponent
 */
export class SidebarInfoItem {
    public id: number;                 // item internal identifier
    public title: string;              // title: view/form label
    public value: any;                 // data value
    public key: string;                // data object key

    public view: boolean;              // whether item should be displayed in non-edit mode
    public edit: boolean;              // whether item should be displayed in edit mode
    public link: boolean;              // TODO: link logic is quite strange for now

    public checkbox: boolean;          // checkbox flag
    public checkboxGroup: string;      // checkbox group name

    public dropdown: boolean;          // dropdown flag
    public options: any[];             // dropdown options array

    public disabled: boolean;          // disabled flag (non-editable in edit mode)
    public className: string;          // specific css class to be added to component

    private type: SidebarInfoItemType;  // type of item control: input, checkbox, dropdown


    constructor(id: number, title: string, value: any, view: boolean = true, edit: boolean = false, link: boolean = false, className: string = '') {
        this.id = id;
        this.title = title;
        this.value = value;
        this.view = view;
        this.edit = edit;
        this.link = link;
        this.className = className;

        this.disabled = false;

        this.init({});
    }

    // { view: true, className: 'css', options: [ 'up', 'down' ] ... }
    init(options: any): void {
        Object.keys(options).forEach(key => {
            this[key] = options[key];
        });
        if (this.options && this.options.length > 0) {
            this.type = SidebarInfoItemType.Select;
            this.checkbox = this.link = this.edit = false;
        }
        else if (this.checkbox) {
            this.type = SidebarInfoItemType.Checkbox;
            this.dropdown = this.link = this.edit = false;
        }
        else if (this.link) {
            this.type = SidebarInfoItemType.Link;
            this.dropdown = this.checkbox = this.edit = false;
        }
        else if (this.edit) {
            this.type = SidebarInfoItemType.Edit;
            this.dropdown = this.checkbox = this.link = false;
        }
        else {
            this.type = SidebarInfoItemType.View;
            this.dropdown = this.checkbox = this.link = this.edit = false;
        }
    }
}

export enum SidebarInfoItemType {
    View,
    Edit,
    Link,
    Select,
    Checkbox,
}

export class SidebarButtonItem {
    id: number;
    title: string;
    type: string;

    constructor(id: number, title: string, type: string) {
        this.id = id;
        this.title = title;
        this.type = type;
    }
}

export class TagModel {
    key: string;
    title: string;
    selected?: boolean;
}

export class ButtonItem {
    id: number;
    title: string;
    type: string;
    visible: boolean;
    inactive: boolean;

    constructor(id?: number, title?: string, type?: string, visible?: boolean, inactive?: boolean) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.visible = visible;
        this.inactive = inactive;
    }
}

export class FilterItem {
    id: number;
    key: string;
    name: string;
    options: any[];
    optionsDisplayKey: string;
    placeHolder: string;
    width: number;
    hidden: boolean;
    inputCenter: boolean;
    minMaxText: string;
    min: string;
    max: string;
    focus: boolean;

    constructor(id?: number, key?: string, name?: string, options?: any[], optionsDisplayKey?: string, placeHolder?: string,
                width?: number, hidden?: boolean, inputCenter?: boolean, minMaxText?: string, min?: string, max?: string, focus?: boolean) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.options = options;
        this.optionsDisplayKey = optionsDisplayKey;
        this.placeHolder = placeHolder;
        this.width = width;
        this.hidden = hidden;
        this.inputCenter = inputCenter || false;
        this.minMaxText = minMaxText;
        this.min = min;
        this.max = max;
        this.focus = focus;
    }
}

export class InputAction {
    id: number;
    type: string; //add-delete
    objects: any;

    constructor(id: number, type: string, objects?: any) {
        this.id = id;
        this.type = type;
        this.objects = objects;
    }
}

export class PlayerModel {
    public animationState: string = 'min';
    public expanded: boolean = false;
}

export class RecordModel {
    public playing: boolean = false;
    public playable: boolean = false;
    public duration: number = 0;
    public mediaStream: string = null;
    public mediaStreamId: number = 0;
    public mediaLoading: boolean = false;
    public mediaPlayTime: number = 0;
    public onTimeChange: Subscription = null;
    public onPlayEnd: Subscription = null;
}
