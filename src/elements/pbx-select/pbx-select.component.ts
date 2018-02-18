import {Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';

import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
  selector: 'pbx-select',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '.2s')]
})

export class SelectComponent {
  @Input() options: any[];
  @Input() selected: object;
  @Input() placeholder: string;
  @Output() onSelect: EventEmitter<object> = new EventEmitter();
  isVisible = false;
  @ViewChild('optionsWrap') optionsWrap: ElementRef;
  @ViewChild('selectWrap') selectWrap: ElementRef;
  @HostListener('window:keydown', ['$event']) globalHide(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.hideOptions();
    }
  }
  calcPosition(): string {
    const comparison = (window.innerHeight - this.selectWrap.nativeElement.offsetTop + 40) > 230;
    return comparison ? 'bottom' : 'top';
  }
  /*
    Toggle options visibility
   */
  toggleOptions(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      this.isVisible ? this.hideOptions() : this.showOptions();
    }
  }
  /*
    Hide options
   */
  hideOptions(): void {
    this.selectWrap.nativeElement.blur();
    this.isVisible = false;
  }
  /*
    Show options
   */
  showOptions(): void {
    this.selectWrap.nativeElement.focus();
    this.isVisible = true;
    const currentIndex = this.selected ? this.options.indexOf(this.selected) : 0; // Index of selected item
    setTimeout(() => this.scrollToCurrent(currentIndex), 1);
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
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.onSelect.emit(option);
    this.hideOptions();
  }
  /*
    Arrows navigation
   */
  keyboardNavigation(event: KeyboardEvent) {
    const currentIndex = this.options.indexOf(this.selected); // Index of selected item
    switch (event.code) {
      case 'Space': {
        this.toggleOptions();
        break;
      }
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
      default: break;
    }
  }
}
