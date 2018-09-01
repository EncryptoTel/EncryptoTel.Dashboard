import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FadeAnimation } from "../../shared/fade-animation";


@Component({
    selector: 'pbx-view-edit-control',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})
export class ViewEditControlComponent implements OnInit {
    editMode: boolean;

    @Input() headerText: string;
    @Input() buttonText: string;
    @Input() noDataMessage = 'No data to display';

    @Input() tableInfo: {};
    @Input() items: any[];
    @Input() selectedItems: any[];

    @Output() onEditModeChanged: EventEmitter<boolean>;

    get hasData(): boolean {
        return !!this.selectedItems && this.selectedItems.length > 0;
    }

    constructor() {
        this.editMode = false;
        this.onEditModeChanged = new EventEmitter();
    }

    ngOnInit(): void {}

    toggleEditMode(): void {
        this.editMode = !this.editMode;
        this.onEditModeChanged.emit(this.editMode);
    }

    selectItem(item: any): void {
        if (!this.selectedItems) this.selectedItems = [];
        if (this.isSelected(item)) {
            this.deleteSelectedItem(item);
        }
        else {
            this.selectedItems.push(item);
        }
    }

    isSelected(item: any): boolean {
        return this.selectedItems.find(i => i.id === item.id) ? true : false;
    }

    deleteSelectedItem(item: any): void {
        this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    }
}