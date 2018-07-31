import {Output, EventEmitter} from "@angular/core";

export class MediaGrid {

    public items;

    public columns: MediaGridColumn[];

    private _sortedColumn: MediaGridColumn;
    get sortedColumn(): MediaGridColumn {
        return this._sortedColumn;
    }

    filter: MediaGridFilter;

    @Output() dataUpdateRequired: EventEmitter<void> = new EventEmitter<void>();

    constructor(columns: MediaGridColumn[]) {
        this.columns = columns;
        this.filter = new MediaGridFilter(this.dataUpdateRequired);
    }

    sort(column: MediaGridColumn): void {
        if (column.sortable) {
            this.columns.forEach(c => {
                if (c.field !== column.field) {
                    c.resetSort();
                }
            });

            column.setSorted();
            this._sortedColumn = column;

            this.dataUpdateRequired.emit();
        }
    }

    sortByIndex(index: number): void {
        if (!this.columns || index >= this.columns.length) return;
        this.sort(this.columns[index]);
    }

    setFilterTags(tags: MediaTag[]) {
        this.filter.setTags(tags);
    }
}

export class MediaGridColumn {
    direction: string;
    sorted: boolean;

    constructor(public field: string, public title: string, public sortable?: boolean) {
        this.field = this.field || '';
        this.title = this.title || '';
        this.sortable = (this.sortable == null) ? true : this.sortable;
        this.direction = '';
        this.sorted = false;
    }

    get iconSuffix(): string {
        if (!this.sorted) return '';
        return (this.direction == 'asc') ? 'up' : 'down';
    }

    setSorted(): void {
        if (!this.sortable) return;

        if (this.sorted) {
            this.direction = (this.direction == 'asc') ? 'desc' : 'asc';
        }
        else {
            this.sorted = true;
            this.direction = 'desc';
        }
    }

    resetSort(): void {
        if (!this.sortable) return;

        this.sorted = false;
        this.direction = '';
    }
}

export class MediaGridFilter {
    private _tags: MediaTag[];
    private _selectedTags: MediaTag[];

    get selectedTags(): MediaTag[] {
        return this._selectedTags;
    }

    get unselectedTags(): MediaTag[] {
        let selectedKeys = this._selectedTags.map(t => {
            return t.key
        });
        return (selectedKeys) ? this._tags.filter(t => !selectedKeys.includes(t.key)) : [];
    }

    constructor(
        public dataUpdateRequired: EventEmitter<void>
    ) {
        this._tags = [];
        this._selectedTags = [];
    }

    setTags(tags: MediaTag[]): void {
        this._tags = tags;
        this._selectedTags = [];
    }

    toggleTag(key: string): void {
        if (this._selectedTags.find(t => t.key == key)) {
            this._selectedTags = this._selectedTags.filter(t => t.key != key);
        }
        else {
            let tag = this._tags.find(t => t.key == key);
            this._selectedTags.push(tag);
        }
        this.dataUpdateRequired.emit();
    }

    checkTagSelected(key: string): boolean {
        return this._selectedTags.find(t => t.key == key) !== undefined;
    }
}

export class MediaTag {
    key: string;
    title: string;
}