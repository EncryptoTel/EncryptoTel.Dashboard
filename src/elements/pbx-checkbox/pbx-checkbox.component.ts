import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'pbx-checkbox',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CheckboxComponent {
  @Input() value: boolean;
  @Output() onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  toggleCheckbox(): void {
    this.value = !this.value;
    this.onToggle.emit(this.value);
  }
}
