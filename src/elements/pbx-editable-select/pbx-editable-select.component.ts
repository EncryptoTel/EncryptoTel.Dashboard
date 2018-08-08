import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';

import {SwipeAnimation} from '../../shared/swipe-animation';
import {assertNumber} from "@angular/core/src/render3/assert";

@Component({
    selector: 'pbx-editable-select',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})
export class EditableSelectComponent implements OnInit {
    isVisible: boolean;
    filterValue: string;

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


    constructor() {
        this.isVisible = false;

        this.onSelect = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
    }

    ngOnInit(): void {}

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
        this.keyboardNavigation(event);
    }

    inputKeyDown(event: KeyboardEvent): void {
        console.log('inputKeyDown($event)', event);
        if (event.code == 'Enter') {
            if (this.isVisible) {
                // take item and select it
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
        const currentIndex = this.selected ? this.options.indexOf(this.selected) : 0; // Index of selected item
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
        if (event) {
            // event.stopPropagation();
            // event.preventDefault();
        }
        this.onSelect.emit(option);
        this.hideOptions();
    }

    /**
     * Arrows navigation
     * @param event KeyboardEvent
     */
    keyboardNavigation(event: KeyboardEvent) {
        const currentIndex = this.options.findIndex(item => {
            return Number.isInteger(item) ? item === this.selected : item.id === this.selected.id;
        });
        switch (event.code) {
            // case 'Space': {
            //     this.toggleOptions();
            //     break;
            // }
            case 'ArrowDown': {
                if ((currentIndex + 1) !== this.options.length) {
                    this.onSelect.emit(this.options[currentIndex + 1]);
                    this.scrollToCurrent(currentIndex + 1);
                } else {
                    this.onSelect.emit(this.options[0]);
                    this.scrollToCurrent(0);
                }
                break;
            }
            case 'ArrowUp': {
                if (currentIndex > 0) {
                    this.onSelect.emit(this.options[currentIndex - 1]);
                    this.scrollToCurrent(currentIndex - 1);
                } else {
                    this.onSelect.emit(this.options[this.options.length - 1]);
                    this.scrollToCurrent(this.options.length - 1);
                }
                break;
            }
            case 'Enter': {
                if (this.isVisible) {
                    this.selectItem(this.options[currentIndex]);
                }
                break;
            }
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
