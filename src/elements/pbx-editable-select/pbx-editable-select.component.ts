import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
    selector: 'pbx-editable-select',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('y', '200ms')]
})
export class EditableSelectComponent implements OnInit, OnChanges {
    public isVisible: boolean;
    public filterValue: string;
    public filteredSelectedItem: any;
    public filteredOptions: any[];
    public inFocus: boolean;

    private _placeholder: string;

    @Input() name: string;
    @Input() singleBorder: boolean;
    @Input() options: any[];
    @Input() objectKey: string;
    @Input() selected: any; // read selectedItem
    @Input() errors: any[];
    
    @Output() onSelect: EventEmitter<object>;
    @Output() onOpen: EventEmitter<object>;
    @Output() onClose: EventEmitter<object>;
    @Output() onFocus: EventEmitter<object>;
    @Output() onBlur: EventEmitter<object>;

    @ViewChild('optionsWrap') optionsWrap: ElementRef;
    @ViewChild('selectWrap') selectWrap: ElementRef;
    @ViewChild('selectInput') selectInput: ElementRef;

    // -- component lifecycle functions -------------------

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

    // -- placeholder functions ---------------------------

    @Input()
    set placeholder(placeholder: string) {
        this._placeholder = placeholder;
    }
    
    get placeholder(): string {
        return this._placeholder;
    }

    get isPlaceholder(): boolean {
        return this.currentIndex < 0;
    }

    // -- selection functions -----------------------------

    get currentIndex(): number {
        return this.filteredOptions.findIndex(item => this.isItemSelected(item));
    }

    isItemSelected(item: any): boolean {
        return Number.isInteger(item) ? item === this.filteredSelectedItem : item.id === this.filteredSelectedItem.id;
    }

    selectItem(option: object, event?: Event): void {
        if (event) this.killEvent(event);

        this.onSelect.emit(option);
        this.hideOptions();
    }

    // -- event handlers ----------------------------------

    @HostListener('window:keydown', ['$event'])
    globalHide(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.hideOptions();
        }
    }

    inputKeyDown(event) {
        this.handleInputKeyboardEvent(event);
    }

    inputKeyUp(event) {
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].indexOf(event.code) < 0) {
            this.filterOptions();
        }
    }

    ctrlKeyDown(event) {
        this.handleCtrlKeyboardEvent(event);
    }

    ctrlFocus(event) {
        this.inFocus = true;
    }

    inputMouseDown(event) {
        if (this.isVisible) this.hideOptions();
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

    handleInputKeyboardEvent(event: KeyboardEvent): void {
        switch (event.code) {
            case 'ArrowDown': {
                if ((this.currentIndex + 1) !== this.filteredOptions.length) {
                    this.filteredSelectedItem = this.filteredOptions[this.currentIndex + 1];
                    this.scrollToCurrent();
                } else {
                    this.filteredSelectedItem = this.filteredOptions[0];
                    this.scrollToCurrent();
                }
                this.killEvent(event);
                break;
            }
            case 'ArrowUp': {
                if (this.currentIndex > 0) {
                    this.filteredSelectedItem = this.filteredOptions[this.currentIndex - 1];
                    this.scrollToCurrent();
                } else {
                    this.filteredSelectedItem = this.filteredOptions[this.filteredOptions.length - 1];
                    this.scrollToCurrent();
                }
                this.killEvent(event);
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

    killEvent(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
    }

    // -- dropdown & filtering ----------------------------

    toggleOptions(): void {
        this.isVisible ? this.hideOptions() : this.showOptions();
    }

    showOptions(): void {
        this.isVisible = true;
        this.onOpen.emit();
        this.onFocus.emit();
        this.setSelectInputFocus(true);
        this.scrollToCurrent(true);
    }

    hideOptions(): void {
        if (this.inFocus) this.setSelectCtrlFocus(true);
        this.isVisible = false;
        this.resetFilter();
        this.onClose.emit();
        this.onBlur.emit();
    }

    filterOptions(): void {
        this.filteredOptions = this.options
            .filter(opt => !this.filterValue || opt[this.objectKey].toLowerCase().search(this.filterValue.toLowerCase()) >= 0);
        this.filteredSelectedItem = (this.filterValue) ? this.filteredOptions[0] : this.selected;
        this.scrollToCurrent();
    }

    resetFilter(): void {
        this.filteredSelectedItem = this.selected;
        this.filterValue = '';
        this.filterOptions();
    }

    // -- helpers -----------------------------------------

    calcPosition(): string {
        const comparison = (window.innerHeight - this.selectWrap.nativeElement.offsetTop + 40) > 230;
        return comparison ? 'bottom' : 'top';
    }

    scrollToCurrent(deferred: boolean = false): void {
        if (this.isVisible && this.optionsWrap) {
            const optionsWrap = this.optionsWrap.nativeElement;
            let scrollFn = () => { optionsWrap.scrollTop = (this.currentIndex - 2) * 40; }
            (deferred) ? setTimeout(scrollFn, 0) : scrollFn();
        }
    }
}
