import {Component, Input, Output, EventEmitter} from "@angular/core";
import {TagModel} from "../../models/base.model";
import {BaseComponent} from "../pbx-component/pbx-component.component";
import {AnimationComponent} from "../../shared/shared.functions";

@AnimationComponent({
    selector: 'pbx-tag-selector',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})
export class TagSelectorComponent extends BaseComponent {
    @Input() public tags: TagModel[];
    @Output() selectionChanged: EventEmitter<void>;

    private _selectedTags: TagModel[];

    get selectedTags(): TagModel[] {
        return this._selectedTags;
    }
    
    get unselectedTags(): TagModel[] {
        let selectedKeys = this._selectedTags.map(t => { return t.key });
        return (selectedKeys) ? this.tags.filter(t => !selectedKeys.includes(t.key)) : [];
    }

    constructor() {
        super();

        this.tags = [];
        this._selectedTags = [];
        this.selectionChanged = new EventEmitter();
    }

    setTags(tags: TagModel[]): void {
        this.tags = tags;
        this._selectedTags = [];
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