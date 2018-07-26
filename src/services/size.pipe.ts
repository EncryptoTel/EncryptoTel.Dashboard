import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'Size'})
export class SizePipe implements PipeTransform {
    transform(value: number): string {
        const result = Math.round(value / 1024 / 1024 * 100) / 100;
        return `${result}`;
    }
}