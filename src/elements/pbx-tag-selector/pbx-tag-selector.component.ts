import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from "@angular/core";
import {TagModel} from "../../models/base.model";
import {BaseComponent} from "../pbx-component/pbx-component.component";
import {AnimationComponent} from "../../shared/shared.functions";

@AnimationComponent({
    selector: 'pbx-tag-selector',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class TagSelectorComponent extends BaseComponent implements OnChanges {
    private _selectedTags: TagModel[];

    @Input() public tags: TagModel[];
    @Output() selectionChanged: EventEmitter<void>;

    get selectedTags(): TagModel[] {
        return this._selectedTags;
    }
    
    get unselectedTags(): TagModel[] {
        let selectedKeys = this._selectedTags.map(t => { return t.key });
        return (selectedKeys) ? this.tags.filter(t => !selectedKeys.includes(t.key)) : [];
    }

    constructor() {
        super/*!*/();

        this.tags = [];
        this._selectedTags = [];
        this.selectionChanged = new EventEmitter();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.tags && changes.tags.currentValue) {
            this.setTags(changes.tags.currentValue);
        }
    }

    setTags(tags: TagModel[]): void {
        this.tags = tags.filter(t => !t.selected);
        this._selectedTags = tags.filter(t => t.selected);
    }

    toggleTag(key: string): void {
        if (this._selectedTags.find(t => t.key == key)) {
            this._selectedTags = this._selectedTags.filter(t => t.key != key);
        }
        else {
            let tag = this.tags.find(t => t.key == key);
            this._selectedTags.push(tag);
        }
        this.selectionChanged.emit();
    }

    checkTagSelected(key: string): boolean {
        return this._selectedTags.find(t => t.key == key) !== undefined;
    }
}