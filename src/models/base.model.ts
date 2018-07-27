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
    sort: {
        isDown: boolean;
        column: string;
    } = {isDown: false, column: null};
}

export class TableInfoItem {
    title: string;
    key: string;
    width: number;
    sort: string;
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

    constructor(id: number, title: string, value: any, view = true, edit = false, link = false) {
        this.id = id;
        this.title = title;
        this.value = value;
        this.view = view;
        this.edit = edit;
        this.link = link;
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