import {Component} from '@angular/core';

@Component({
  selector: 'pbx-marketplace',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class MarketplaceComponent {
  modules = [
    new Module(1, 'Module COMPANY', 'Company information', 0, true, 1),
new Module(2, 'Module IVR', 'Interactive voice response (IVR) is a technology that allows a computer to interact with humans through the use of voice and DTMF tones input via keypad.', 10, false, 2),
    new Module(3, 'Module Call-center', '', 10, false, 2),
    new Module(4, 'Module Queue', '', 10, false, 2),
    new Module(5, 'Module SIP TRAFFIC ENCRYPTION', '', 10, false, 3),
    new Module(6, 'Module Ext 50', 'Amount of Ext numbers 50', 0, false, 4),
    new Module(7, 'Module Ext 100', 'Amount of Ext numbers 100', 10, false, 4),
    new Module(8, 'Module Schedule', '', 0, false, 5),
    new Module(9, 'Module Storage 500 mb', 'Storage space 500 mb', 10, false, 6),
    new Module(10, 'Module Storage 1000 mb', 'Storage space 1000 mb', 10, false, 6),
    new Module(11, 'Module Storage 1500 mb', 'Storage space 1500 mb', 10, false, 6),
  ];
}

export class Module {
  constructor (
    public id: number,
    public title: string,
    public content: string,
    public cost: number,
    public status: boolean,
    public color: number) {}
}

