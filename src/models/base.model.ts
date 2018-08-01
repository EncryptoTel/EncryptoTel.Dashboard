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

    constructor(title: string, key: string, sort?: string, width?: number, dataWidth?: number) {
        this.title = title;
        this.key = key;
        this.width = width;
        this.dataWidth = dataWidth;
        this.sort = sort;
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

export class SidebarInfoItem {
    id: number;
    title: string;
    value: any;
    view: boolean;
    edit: boolean;
    link: boolean;
    key: string;
    checkbox: boolean;
    className: string;

    constructor(id: number, title: string, value: any, view = true, edit = false, link = false, className = '') {
        this.id = id;
        this.title = title;
        this.value = value;
        this.view = view;
        this.edit = edit;
        this.link = link;
        this.className = className;
    }
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
}

export class ButtonItem {
    id: number;
    title: string;
    type: string;
    visible: boolean;
    inactive: boolean;
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

    constructor(id?: number, key?: string, name?: string, options?: any[], optionsDisplayKey?: string, placeHolder?: string,
                width?: number, hidden?: boolean, inputCenter?: boolean, minMaxText?: string, min?: string, max?: string) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.options = options;
        this.optionsDisplayKey = optionsDisplayKey;
        this.placeHolder = placeHolder;
        this.width = width;
        this.hidden = hidden;
        this.inputCenter = inputCenter;
        this.minMaxText = minMaxText;
        this.min = min;
        this.max = max;
    }
}
