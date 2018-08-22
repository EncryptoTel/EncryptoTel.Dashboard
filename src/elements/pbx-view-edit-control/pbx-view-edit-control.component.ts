import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { FadeAnimation } from "../../shared/fade-animation";

@Component({
    selector: 'pbx-view-edit-control',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class ViewEditControlComponent implements OnInit, OnChanges {
    editMode: boolean;

    @Input() headerText: string;
    @Input() buttonText: string;

    @Input() tableInfo: {};
    @Input() items: any[];
    @Input() selectedItems: any[];
    remainingItems: any[];

    @Output() onEditModeChanged: EventEmitter<boolean>;

    constructor() {
        this.editMode = false;
        this.onEditModeChanged = new EventEmitter();
    }

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.items && changes.items.currentValue || changes.selectedItems && changes.selectedItems.currentValue) {
            this.intersectItems();
        }
    }

    toggleEditMode(): void {
        this.editMode = !this.editMode;
        this.onEditModeChanged.emit(this.editMode);
    }

    intersectItems(): void {
        if (this.items) {
            if (this.selectedItems) {
                const selectedIds = this.selectedItems.map(item => item.id);
                this.remainingItems = this.items.filter(item => selectedIds.indexOf(item.id) < 0);
            }
            else {
                this.remainingItems = this.items;
            }
        }

        if (this.remainingItems.length == 0 && this.editMode) {
            this.toggleEditMode();
        }
    }

    selectItem(item: any): void {
        // console.log('selected', item);
        if (!this.selectedItems) this.selectedItems = [];
        this.selectedItems.push(item);
        this.intersectItems();
    }

    deleteItem(item: any): void {
        this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
        this.intersectItems();
    }
}