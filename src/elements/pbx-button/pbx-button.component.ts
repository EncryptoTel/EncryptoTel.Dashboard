import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-button',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class ButtonComponent {
  @Input() value: string;
  @Input() buttonType: string;
  @Input() loading: boolean;
  @Input() inactive: boolean;
  @Input() propogation: boolean;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('button') button: ElementRef;

  constructor() {
    if (!this.value) {
      this.value = 'Submit';
    }
    if (!this.buttonType) {
      this.buttonType = 'accent';
    }
  }

  clicked(ev?: MouseEvent): void {
    if (ev) {
      ev.preventDefault();
    } else if (ev && !this.propogation) {
      ev.stopPropagation();
    }
    const div = document.createElement('div');
    const radius = this.button.nativeElement.clientWidth;
    div.style.width = div.style.height = radius + 'px';
    div.style.top = ev.offsetY - radius / 2 + 'px';
    div.style.left = ev.offsetX - radius / 2 + 'px';
    div.classList.add('button_overlay');
    this.button.nativeElement.appendChild(div);
    if (radius < 150) {
      div.classList.add('small');
      setTimeout(() => {
        this.button.nativeElement.removeChild(div);
      }, 300);
    } else if (radius >= 150 && radius < 300) {
      div.classList.add('medium');
      setTimeout(() => {
        this.button.nativeElement.removeChild(div);
      }, 400);
    } else {
      setTimeout(() => {
        this.button.nativeElement.removeChild(div);
      }, 550);
    }
    this.onClick.emit();
  }
}
