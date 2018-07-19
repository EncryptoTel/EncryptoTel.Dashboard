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
        // console.log(this.constructor.name);
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
        // console.log(this.constructor.name);
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
    width: boolean;
    sort: string;
}

