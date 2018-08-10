import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges} from '@angular/core';

import {SwipeAnimation} from '../../shared/swipe-animation';
import {assertNumber} from "@angular/core/src/render3/assert";

@Component({
    selector: 'pbx-editable-select',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})
export class EditableSelectComponent implements OnInit, OnChanges {
    isVisible: boolean;
    filterValue: string;
    filteredSelectedItem: any;
    filteredOptions: any[];
    inFocus: boolean;

    @Input() name: string;
    @Input() singleBorder: boolean;
    @Input() options: any[];
    @Input() objectKey: string;
    @Input() selected: any; // read selectedItem
    @Input() placeholder: string;
    @Input() errors: any[];

    @Output() onSelect: EventEmitter<object>;
    @Output() onOpen: EventEmitter<object>;
    @Output() onClose: EventEmitter<object>;
    @Output() onFocus: EventEmitter<object>;
    @Output() onBlur: EventEmitter<object>;

    @ViewChild('optionsWrap') optionsWrap: ElementRef;
    @ViewChild('selectWrap') selectWrap: ElementRef;
    @ViewChild('selectInput') selectInput: ElementRef;

    constructor() {
        this.isVisible = false;
        this.inFocus = false;

        this.onSelect = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
    }

    ngOnInit(): void {
        this.resetFilter();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selected && changes.selected.currentValue) {
            this.filteredSelectedItem = changes.selected.currentValue;
        }
    }

    get currentIndex(): number {
        return this.filteredOptions.findIndex(item => this.isItemSelected(item));
    }

    isItemSelected(item: any): boolean {
        return Number.isInteger(item) ? item === this.filteredSelectedItem : item.id === this.filteredSelectedItem.id;
    }

    isCurrent(item) {
        return this.filteredSelectedItem ? this.isItemSelected(item) : false;
    }

    @HostListener('window:keydown', ['$event']) globalHide(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.hideOptions();
        }
    }

    calcPosition(): string {
        const comparison = (window.innerHeight - this.selectWrap.nativeElement.offsetTop + 40) > 230;
        return comparison ? 'bottom' : 'top';
    }

    objectTitle(obj: any): string {
        if ('title' in obj) return obj['title'];
        if ('name' in obj) return obj['name'];
        if ('id' in obj) return obj['id'];
        return '';
    }

    setSelectCtrlFocus(state: boolean): void {
        if (state) {
            setTimeout(() => this.selectWrap.nativeElement.focus(), 0);
        }
        else {
            setTimeout(() => this.selectWrap.nativeElement.blur(), 0);
        }
    }

    setSelectInputFocus(state: boolean): void {
        if (state) {
            setTimeout(() => this.selectInput.nativeElement.focus(), 0);
        }
        else {
            setTimeout(() => this.selectInput.nativeElement.blur(), 0);
        }
    }

    resetFilter(): void {
        this.filteredSelectedItem = this.selected;
        this.filterValue = '';
        this.filterOptions();
    }

    filterOptions(): void {
        this.filteredOptions = this.options
            .filter(opt => !this.filterValue || this.objectTitle(opt).toLowerCase().search(this.filterValue.toLowerCase()) >= 0);
        this.filteredSelectedItem = this.filteredOptions[0];
        this.scrollToCurrent(0);
    }

    /*
      Toggle options visibility
     */
    toggleOptions(): void {
        this.isVisible ? this.hideOptions() : this.showOptions();
    }

    /*
      Hide options
     */
    hideOptions(): void {
        if (this.inFocus) this.setSelectCtrlFocus(true);
        this.isVisible = false;
        this.resetFilter();
        this.closed();
        this.onBlur.emit();
    }

    /*
      Show options
     */
    showOptions(): void {
        // this.selectWrap.nativeElement.focus();
        this.isVisible = true;
        const currentIndex = this.selected ? this.options.indexOf(this.selected) : 0; // Index of selected item
        setTimeout(() => this.scrollToCurrent(currentIndex), 1);
        this.opened();
        this.onFocus.emit();
        this.setSelectInputFocus(true);
    }

    /*
      Scroll to selected option
     */
    scrollToCurrent(currentIndex: number): void {
        if (this.isVisible && this.optionsWrap) {
            const optionsWrap = this.optionsWrap.nativeElement; // Options list HTML element
            optionsWrap.scrollTop = (currentIndex - 2) * 40;
        }
    }

    /*
      Select option
     */
    selectItem(option: object, event?: Event): void {
        if (event) this.killEvent(event);

        this.onSelect.emit(option);
        this.hideOptions();
    }

    /*
      Arrows navigation
     */
    handleInputKeyboardEvent(event: KeyboardEvent): void {
        switch (event.code) {
            case 'ArrowDown': {
                if ((this.currentIndex + 1) !== this.filteredOptions.length) {
                    // this.onSelect.emit(this.filteredOptions[this.currentIndex + 1]);
                    this.filteredSelectedItem = this.filteredOptions[this.currentIndex + 1];
                    this.scrollToCurrent(this.currentIndex + 1);
                } else {
                    // this.onSelect.emit(this.filteredOptions[0]);
                    this.filteredSelectedItem = this.filteredOptions[0];
                    this.scrollToCurrent(0);
                }
                break;
            }
            case 'ArrowUp': {
                if (this.currentIndex > 0) {
                    // this.onSelect.emit(this.filteredOptions[this.currentIndex - 1]);
                    this.filteredSelectedItem = this.filteredOptions[this.currentIndex - 1];
                    this.scrollToCurrent(this.currentIndex - 1);
                } else {
                    // this.onSelect.emit(this.filteredOptions[this.filteredOptions.length - 1]);
                    this.filteredSelectedItem = this.filteredOptions[this.filteredOptions.length - 1];
                    this.scrollToCurrent(this.filteredOptions.length - 1);
                }
                break;
            }
            case 'Enter': {
                this.selectItem(this.filteredOptions[this.currentIndex]);
                this.killEvent(event);
                break;
            }
            case 'Tab': {
                if (this.isVisible) this.hideOptions();
                this.inFocus = false;
                break;
            }
        }
    }

    handleCtrlKeyboardEvent(event: KeyboardEvent): void {
        switch (event.code) {
            case 'Enter': {
                this.showOptions();
                break;
            }
            case 'Tab': {
                if (this.isVisible) this.hideOptions();
                this.inFocus = false;
                break;
            }
        }
    }

    opened() {
        this.onOpen.emit();
    }

    closed() {
        this.onClose.emit();
    }

    killEvent(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
    }

    // ---
    checkError() {}

    inputKeyDown(event) { 
        this.handleInputKeyboardEvent(event);
    }

    inputKeyUp(event) {
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].indexOf(event.code) < 0) {
            this.filterOptions();
        }
    }

    inputFocus(event) { /*console.log('inputFocus', event);*/ }
    inputBlur(event) { /*console.log('inputBlur', event);*/ }

    ctrlKeyDown(event) {
        this.handleCtrlKeyboardEvent(event);
    }

    inputMouseEnter(event) { /*console.log('inputMouseEnter', event);*/ }
    inputMouseLeave(event) { /*console.log('inputMouseLeave', event);*/ }
    ctrlBlur(event) { /* console.log('ctrlBlur', event); */ }
    
    ctrlFocus(event) { 
        this.inFocus = true;
    }
    
    inputMouseDown(event) {
        this.killEvent(event);
    }
    
    ctrlMouseDown(event) { 
        if (!this.inFocus) {
            this.inFocus = true;
            this.setSelectCtrlFocus(true);
        }
        this.toggleOptions();
        this.killEvent(event);
    }

    clickOutside(): void {
        this.inFocus = false;
        this.setSelectCtrlFocus(false);
        this.hideOptions();
    }
}
