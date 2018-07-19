import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'pbx-circle-progress',
  templateUrl: './template.html',
  styleUrls: ['./local.css']
})

export class DiskUsedComponent implements OnInit, OnChanges {

  @Input() value: number;

  private radius = 76;
  private circumference = 2 * Math.PI * this.radius;
  private dashoffset: number;

  constructor() {
    this.progress(0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value.currentValue !== changes.value.previousValue) {
      this.progress(changes.value.currentValue);
    }
  }

  ngOnInit() { }

  private progress(value: number) {
    const progress = value / 100;
    this.dashoffset = this.circumference * (1 - progress);
  }
}
