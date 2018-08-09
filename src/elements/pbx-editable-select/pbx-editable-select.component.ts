import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, OnChanges} from '@angular/core';

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
    filteredOptions: any[];

    @Input() name: string;
    @Input() singleBorder: boolean;
    @Input() options: any[];
    @Input() objectKey: string;
    @Input() selected: any;
    @Input() placeholder: string;
    @Input() errors: any[];
    @Input() inputWidth: number;

    @Output() onSelect: EventEmitter<object>;
    @Output() onOpen: EventEmitter<object>;
    @Output() onClose: EventEmitter<object>;
    @Output() onFocus: EventEmitter<object>;
    @Output() onBlur: EventEmitter<object>;

    @ViewChild('optionsWrap') optionsWrap: ElementRef;
    @ViewChild('selectWrap') selectWrap: ElementRef;
    @ViewChild('selectInput') selectInput: ElementRef;

    get currentIndex(): number {
        return this.filteredOptions.findIndex(item => {
            return Number.isInteger(item) ? item === this.selected : item.id === this.selected.id;
        });
    }


    constructor() {
        this.isVisible = false;
        this.filterValue = '';

        this.onSelect = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
    }

    ngOnInit(): void {
        console.log('selected', this.selected);
        this.filterOptions();
        // TODO: __DEBUG__
        this.placeholder = 'Select Country';
        console.log('selected', this.selected);
    }
    
    ngOnChanges(): void {
        // TODO: track option changes
    }

    filterOptions(): void {
        console.log('filterValue', this.filterValue);
        this.filteredOptions = this.options
            .filter(opt => !this.filterValue || this.objectTitle(opt).toLowerCase().search(this.filterValue.toLowerCase()) >= 0);
    }

    objectTitle(obj: any): string {
        if ('title' in obj) return obj['title'];
        if ('name' in obj) return obj['name'];
        if ('id' in obj) return obj['id'];
        return '';
    }

    @HostListener('window:keydown', ['$event']) globalHide(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.hideOptions();
        }
    }

    ctrlFocus(event) {
        // console.log('ctrlFocus($event)', event);
    }

    ctrlBlur(event) {
        // console.log('ctrlBlur($event)', event);
    }

    ctrlMouseDown(event: MouseEvent) {
        // console.log('ctrlMouseDown($event)', event);
        this.toggleOptions();
    }

    ctrlKeyDown(event: KeyboardEvent) {
        // console.log('ctrlKeyDown($event)', event);
        // this.keyboardNavigation(event);
    }

    inputKey(event: KeyboardEvent): void {
        console.log('inputKeyDown($event)', event);
        if (event.code == 'Enter') {
            if (this.isVisible) {
                this.selectItem(this.filteredOptions[this.currentIndex]);
                this.hideOptions();
            }
            else {
                this.showOptions();
                this.selectInput.nativeElement.focus();
            }
            this.killEvent(event);
            return;
        }
        
        // TODO: key filtering
        this.filterOptions();
        if (!this.isVisible) this.showOptions();
        this.keyboardNavigation(event);
    }

    inputFocus(event) {
        // console.log('inputFocus($event)', event);
    }

    inputBlur(event) {
        // console.log('inputBlur($event)', event);
    }

    inputMouseEnter(event) {
        // console.log('inputMouseEnter($event)', event);
    }

    inputMouseLeave(event) {
        // console.log('inputMouseLeave($event)', event);
    }

    killEvent(event: Event): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    calcPosition(): string {
        const comparison = (window.innerHeight - this.selectWrap.nativeElement.offsetTop + 40) > 230;
        return comparison ? 'bottom' : 'top';
    }

    /*
      Toggle options visibility
     */
    toggleOptions(): void {
        console.log('selected', this.selected);
        this.isVisible ? this.hideOptions() : this.showOptions();
    }

    /*
      Hide options
     */
    hideOptions(): void {
        this.selectWrap.nativeElement.blur();
        this.isVisible = false;
        this.closed();
        this.onBlur.emit();
    }

    /*
      Show options
     */
    showOptions(): void {
        this.selectWrap.nativeElement.focus();
        this.isVisible = true;
        const currentIndex = this.selected ? this.filteredOptions.indexOf(this.selected) : 0; // Index of selected item
        setTimeout(() => this.scrollToCurrent(currentIndex), 1);
        this.opened();
        this.onFocus.emit();
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

    /**
     * Select option
     * @param option object
     */
    selectItem(option: object, event?: Event): void {
        this.selected = option;
        
        this.filterValue = this.objectTitle(option);
        this.filterOptions();
        
        this.onSelect.emit(option);
        this.hideOptions();
    }

    /**
     * Arrows navigation handling at select dropdown.
     * @param event KeyboardEvent
     */
    keyboardNavigation(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowDown': {
                if ((this.currentIndex + 1) !== this.filteredOptions.length) {
                    this.onSelect.emit(this.filteredOptions[this.currentIndex + 1]);
                    this.scrollToCurrent(this.currentIndex + 1);
                } else {
                    this.onSelect.emit(this.filteredOptions[0]);
                    this.scrollToCurrent(0);
                }
                break;
            }
            case 'ArrowUp': {
                if (this.currentIndex > 0) {
                    this.onSelect.emit(this.filteredOptions[this.currentIndex - 1]);
                    this.scrollToCurrent(this.currentIndex - 1);
                } else {
                    this.onSelect.emit(this.filteredOptions[this.filteredOptions.length - 1]);
                    this.scrollToCurrent(this.filteredOptions.length - 1);
                }
                break;
            }
            // case 'Enter': {
            //     if (this.isVisible) {
            //         this.selectItem(this.filteredOptions[currentIndex]);
            //     }
            //     break;
            // }
            default:
                break;
        }
    }

    isCurrent(item) {
        return this.selected ? (Number.isInteger(item) ? item === this.selected : item.id === this.selected.id) : false;
    }

    opened() {
        this.onOpen.emit();
    }

    closed() {
        this.onClose.emit();
    }

    checkError() {}
    
    setFilterFocus() {
        this.showOptions();
    }

    removeFilterFocus() {
    }
}
